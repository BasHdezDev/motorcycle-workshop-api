# Infraestructura V3: Motorcycle Workshop API en Google Cloud

Este directorio contiene la infraestructura de la V3, declarada con Terraform. La API (NestJS + Fastify + Prisma) corre en Cloud Run, con una base de datos PostgreSQL nueva en Cloud SQL, y un pipeline de GitHub Actions la despliega sin guardar claves de cuentas de servicio.

La V3 es independiente de las entregas anteriores: proyecto, estado y nombres propios. No hay GKE, Pub/Sub ni orquestador.

## 1. Objetivo y arquitectura

```text
Desarrollador -> GitHub -> GitHub Actions
                              |-- autenticación con Workload Identity Federation (sin claves JSON)
                              |-- build -> terraform (fmt, validate, plan, apply bajo petición) -> deploy
                              v
                  Artifact Registry (imagen Docker)
                              |
                              v
        Cloud Run (API, HTTPS pública) --socket Unix--> Cloud SQL for PostgreSQL
                  |                                         ^
                  +-- Secret Manager (DATABASE_URL, API_KEY)|
            Cloud Run Job (migraciones Prisma) -------------+
```

### Recursos que crea Terraform (unos 40)

| Servicio | Recurso | Archivo |
|---|---|---|
| Cloud SQL for PostgreSQL | Instancia `workshop-v3-db-xxxx` (Postgres 17, `db-f1-micro`), base `motorcycle_workshop` y usuario `workshop_user` con contraseña generada | `cloud_sql.tf`, `database.tf` |
| Cloud Run | Servicio `workshop-v3-api` (0 a 2 instancias, 1 CPU, 512 MiB) y acceso público | `cloud_run.tf` |
| Cloud Run Job | `workshop-v3-migrate`, ejecuta `prisma migrate deploy` una sola vez por despliegue | `cloud_run_job.tf` |
| Artifact Registry | Repositorio Docker `workshop-v3-repo` | `artifact_registry.tf` |
| Secret Manager | `workshop-v3-database-url` y `workshop-v3-api-key` | `secrets.tf` |
| IAM | Cuenta `runtime` (la API) y cuenta `deployer` (GitHub Actions), con roles asignados | `iam.tf` |
| Workload Identity Federation | Pool y proveedor OIDC de GitHub, restringidos al repositorio y a ramas permitidas | `workload_identity.tf` |
| APIs de Google Cloud | Habilitación de las APIs necesarias | `apis.tf` |

Otros archivos: `versions.tf` (versiones), `provider.tf`, `backend.tf` (estado remoto), `variables.tf`, `outputs.tf` y `terraform.tfvars.example`.

### Conexión entre Cloud Run y Cloud SQL (una sola estrategia)

Se usa la integración oficial de Cloud Run con Cloud SQL, por socket Unix. La instancia tiene IP pública pero **ninguna red autorizada**, así que nadie puede conectarse desde Internet. La `DATABASE_URL` tiene este formato y se guarda en Secret Manager:

```text
postgresql://USUARIO:CLAVE@localhost/BASE?host=/cloudsql/PROYECTO:REGION:INSTANCIA
```

La contraseña la genera Terraform. No existe en el código, ni en el historial de Git, ni en los logs del pipeline, ni en la imagen.

## 2. Requisitos locales y permisos

- Terraform >= 1.9, Google Cloud CLI (`gcloud`), GitHub CLI (`gh`), Node.js 22 y Docker (opcional, para probar la imagen).
- Un proyecto de Google Cloud con facturación vinculada y una cuenta con rol de propietario para el primer arranque.

### Preparación inicial (una sola vez, a mano)

```powershell
gcloud projects create motorcycle-workshop-v3 --name="Motorcycle Workshop V3"
gcloud config set project motorcycle-workshop-v3
gcloud billing projects link motorcycle-workshop-v3 --billing-account=ID_CUENTA_FACTURACION
gcloud services enable cloudresourcemanager.googleapis.com serviceusage.googleapis.com

# Bucket del estado de Terraform (fuera del estado, para que `destroy` no lo borre)
gcloud storage buckets create gs://motorcycle-workshop-v3-tfstate --project=motorcycle-workshop-v3 --location=us-central1 --uniform-bucket-level-access
gcloud storage buckets update gs://motorcycle-workshop-v3-tfstate --versioning
```

## 3. Variables

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `project_id` | ID del proyecto de Google Cloud | (obligatoria) |
| `github_repository` | Repositorio autorizado, formato `usuario/repositorio` | (obligatoria) |
| `region` | Región única para todos los recursos | `us-central1` |
| `app_name` | Prefijo de los nombres de los recursos | `workshop-v3` |
| `db_tier` | Tipo de máquina de Cloud SQL | `db-f1-micro` |
| `db_name` / `db_user` | Base de datos y usuario de la aplicación | `motorcycle_workshop` / `workshop_user` |
| `db_deletion_protection` | Protección contra borrado de Cloud SQL | `false` (para que `destroy` funcione) |
| `allowed_branches` | Ramas que pueden autenticarse desde GitHub Actions | `["main", "v3-terraform-gcp"]` |
| `state_bucket` | Bucket del estado creado a mano | `motorcycle-workshop-v3-tfstate` |

Crea tu archivo de variables a partir del ejemplo. `terraform.tfvars` está en `.gitignore` y no se sube:

```powershell
cd terraform
Copy-Item terraform.tfvars.example terraform.tfvars
```

No hay contraseñas que escribir: la contraseña de la base y la API key las genera Terraform.

## 4. Autenticación

**Local:**

```powershell
gcloud auth application-default login
gcloud auth application-default set-quota-project motorcycle-workshop-v3
```

**GitHub Actions:** usa Workload Identity Federation. El workflow pide un token OIDC a GitHub y Google lo cambia por credenciales de corta duración de la cuenta `workshop-v3-deployer`. No hay claves JSON. Solo se aceptan tokens de este repositorio y de las ramas de `allowed_branches`.

El workflow lee siete variables del repositorio (no son secretos): `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`, `GCP_ARTIFACT_REGISTRY_URL`, `GCP_CLOUD_RUN_SERVICE` y `GCP_MIGRATION_JOB`. Se copian desde los outputs de Terraform con el script de la raíz del repositorio:

```powershell
.\scripts\sync-github-vars.ps1
```

## 5. Inicializar, revisar y desplegar

```powershell
cd terraform
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
```

El estado vive en el bucket `gs://motorcycle-workshop-v3-tfstate`, con versionado. Contiene datos sensibles (como la contraseña de la base), así que el bucket no debe ser público.

**Primera creación:** siempre desde la terminal. Sin la identidad de Workload Identity creada, el pipeline no puede autenticarse. Tras el `apply`, ejecuta el script de sincronización de variables. El servicio y el job quedan con una imagen de ejemplo, y el pipeline pone la imagen real.

## 6. Pipeline, imagen, migraciones y Cloud Run

El workflow `.github/workflows/deploy-gcp.yml` se ejecuta en cada push a `main` (ignora cambios solo de `.md` o `docs/`) y manualmente. Sus jobs, en orden:

1. **build:** instala dependencias, genera Prisma Client y compila.
2. **terraform:** `fmt -check`, `init`, `validate` y `plan`. El `apply` solo corre si se lanza a mano con `apply_infrastructure=true`:
   ```powershell
   gh workflow run deploy-gcp.yml -f apply_infrastructure=true
   ```
3. **deploy:** construye y sube la imagen (etiquetada con el hash del commit), ejecuta las migraciones con el Cloud Run Job (una sola vez, antes de desplegar) y actualiza Cloud Run. Termina con una comprobación de `/health`.

Las migraciones nunca corren al arrancar el contenedor, para evitar ejecuciones concurrentes entre instancias.

### Equivalente manual de la imagen, las migraciones y el despliegue

```powershell
$IMAGE = "$(terraform output -raw artifact_registry_url)/api:manual"
gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
docker build -t $IMAGE ..
docker push $IMAGE

gcloud run jobs update workshop-v3-migrate --region us-central1 --image $IMAGE
gcloud run jobs execute workshop-v3-migrate --region us-central1 --wait
gcloud run services update workshop-v3-api --region us-central1 --image $IMAGE
```

## 7. Obtener la URL y probar

```powershell
terraform output -raw cloud_run_url
```

- Salud: `GET <URL>/health`
- Swagger: `<URL>/api`
- Endpoints `/v2`: requieren el header `x-api-key`. Léela localmente, sin pegarla en chats ni commits:
  ```powershell
  gcloud secrets versions access latest --secret=workshop-v3-api-key
  ```

La primera petición después de un rato de inactividad tarda unos segundos extra, porque el servicio escala a cero. La base empieza vacía: crea registros desde Swagger (por ejemplo `POST /drivers`).

## 8. Destruir todos los recursos de la V3

Revisa primero qué se borrará. Solo deben aparecer recursos de la V3:

```powershell
cd terraform
terraform plan -destroy
terraform destroy
```

Escribe `yes` para confirmar. Eliminar Cloud SQL tarda varios minutos.

- `deletion_protection` está desactivada en Cloud Run y Cloud SQL a propósito.
- La base de datos y el usuario de PostgreSQL usan `deletion_policy = "ABANDON"`: Postgres no deja borrar un rol que tiene tablas, y ambos desaparecen igual con la instancia.
- Artifact Registry elimina sus imágenes junto con el repositorio.
- El pipeline nunca ejecuta `destroy`: se hace siempre a mano.

**Limpieza completa, después del destroy:**

1. Borra el bucket del estado, que no administra Terraform (hazlo al final, porque contiene el estado):
   ```powershell
   gcloud storage rm -r gs://motorcycle-workshop-v3-tfstate
   ```
2. Si no vas a reutilizar el proyecto: `gcloud projects delete motorcycle-workshop-v3`.
3. Las variables `GCP_*` de GitHub quedan apuntando a recursos que ya no existen: bórralas (`gh variable delete NOMBRE`) o desactiva el workflow.

### Volver a crear la V3 después de destruirla

```powershell
cd terraform
terraform apply
cd ..
.\scripts\sync-github-vars.ps1
gh run rerun --failed   # o lanza el workflow manualmente
```

Los recursos con sufijo aleatorio (instancia de Cloud SQL y pool de identidades) cambian de nombre, por eso hay que volver a sincronizar las variables. La contraseña de la base y la API key se regeneran.

## 9. Datos que se pierden al destruir

- **Todo el contenido de la base de datos**, porque se elimina la instancia. Si necesitas conservar datos, expórtalos antes con `gcloud sql export sql` a un bucket donde la cuenta de servicio de la instancia pueda escribir.
- Las imágenes Docker del repositorio.
- La contraseña de la base y la API key (se generan de nuevo al recrear).
- Las migraciones y el código no se pierden: están en el repositorio.

## 10. Verificar que no queden recursos con costo

```powershell
gcloud run services list --region us-central1
gcloud run jobs list --region us-central1
gcloud sql instances list
gcloud artifacts repositories list --location us-central1
gcloud secrets list
gcloud iam service-accounts list
gcloud iam workload-identity-pools list --location global
gcloud storage buckets list
```

Todo debe salir vacío, salvo las cuentas de servicio por defecto de Google y el bucket del estado si todavía no lo borraste. Revisa también Billing en la consola de Google Cloud.

## Costos

- **Cloud SQL (`db-f1-micro`)** es el único recurso que cobra mientras exista, aunque no reciba tráfico: unos 0.30 a 0.40 USD por día (estimación; confirma en la calculadora de precios de Google Cloud).
- **Cloud Run** escala a cero y no cobra sin tráfico.
- Artifact Registry, Secret Manager y el bucket del estado cuestan centavos.
- No hay GKE, balanceador dedicado, NAT ni Pub/Sub.

## Seguridad

- La cuenta `deployer` tiene roles amplios, porque el pipeline aplica Terraform. Se limita así: solo acepta tokens de este repositorio y de ramas permitidas, y el `apply` requiere una ejecución manual.
- La cuenta `runtime` solo puede conectarse a Cloud SQL y leer sus dos secretos.
- No se guardan claves JSON ni contraseñas en el repositorio. `.env`, `*.tfvars` y los archivos de estado están en `.gitignore`.
