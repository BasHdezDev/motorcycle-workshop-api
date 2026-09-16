import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // ── Drivers ──────────────────────────────────────
    const driver1 = await prisma.driver.create({
        data: {
            firstName: 'Juan',
            lastName: 'Perez',
            documentNumber: '1001234567',
            phone: '3001234567',
            email: 'juan.perez@example.com',
        },
    });

    const driver2 = await prisma.driver.create({
        data: {
            firstName: 'Maria',
            lastName: 'Gomez',
            documentNumber: '1009876543',
            phone: '3109876543',
            email: 'maria.gomez@example.com',
        },
    });

    const driver3 = await prisma.driver.create({
        data: {
            firstName: 'Carlos',
            lastName: 'Rodriguez',
            documentNumber: '1005556677',
            phone: '3205556677',
            email: null,
        },
    });

    // ── Motorcycles ──────────────────────────────────
    const moto1 = await prisma.motorcycle.create({
        data: {
            licensePlate: 'ABC123',
            brand: 'Yamaha',
            model: 'FZ 2.0',
            year: 2022,
            engineDisplacement: 150,
            color: 'Azul',
            chassisNumber: 'CHS-0001',
            engineNumber: 'ENG-0001',
            driverId: driver1.id,
        },
    });

    const moto2 = await prisma.motorcycle.create({
        data: {
            licensePlate: 'DEF456',
            brand: 'Honda',
            model: 'CB 190R',
            year: 2021,
            engineDisplacement: 184,
            color: 'Negro',
            chassisNumber: 'CHS-0002',
            engineNumber: 'ENG-0002',
            driverId: driver1.id,
        },
    });

    const moto3 = await prisma.motorcycle.create({
        data: {
            licensePlate: 'GHI789',
            brand: 'Suzuki',
            model: 'GN 125',
            year: 2020,
            engineDisplacement: 125,
            color: 'Rojo',
            chassisNumber: 'CHS-0003',
            engineNumber: 'ENG-0003',
            driverId: driver2.id,
        },
    });

    const moto4 = await prisma.motorcycle.create({
        data: {
            licensePlate: 'JKL012',
            brand: 'Kawasaki',
            model: 'Pulsar NS 200',
            year: 2023,
            engineDisplacement: 200,
            color: 'Verde',
            chassisNumber: 'CHS-0004',
            engineNumber: 'ENG-0004',
            driverId: driver3.id,
        },
    });

    // ── Service Orders ───────────────────────────────
    await prisma.serviceOrder.create({
        data: {
            orderNumber: 'SO-0001',
            motorcycleId: moto1.id,
            checkInDate: new Date('2026-09-01'),
            problemDescription: 'Ruido extraño en el motor al acelerar',
            status: 'RECEIVED',
        },
    });

    await prisma.serviceOrder.create({
        data: {
            orderNumber: 'SO-0002',
            motorcycleId: moto2.id,
            checkInDate: new Date('2026-08-20'),
            problemDescription: 'Cambio de aceite y filtro',
            diagnosis: 'Mantenimiento preventivo de rutina',
            workPerformed: 'Cambio de aceite, filtro y revisión de frenos',
            status: 'DELIVERED',
            repairCost: 85000.0,
            paymentCompleted: true,
            paymentDate: new Date('2026-08-21'),
            checkOutDate: new Date('2026-08-21'),
        },
    });

    await prisma.serviceOrder.create({
        data: {
            orderNumber: 'SO-0003',
            motorcycleId: moto3.id,
            checkInDate: new Date('2026-09-10'),
            problemDescription: 'Frenos no responden bien',
            diagnosis: 'Pastillas de freno desgastadas',
            status: 'UNDER_REPAIR',
        },
    });

    await prisma.serviceOrder.create({
        data: {
            orderNumber: 'SO-0004',
            motorcycleId: moto4.id,
            checkInDate: new Date('2026-09-14'),
            problemDescription: 'Batería no carga',
            status: 'UNDER_DIAGNOSIS',
        },
    });

    console.log('✅ Seed completed:');
    console.log(`   - 3 drivers`);
    console.log(`   - 4 motorcycles`);
}