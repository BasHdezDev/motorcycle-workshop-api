import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const providedKey = request.headers['x-api-key'];
        const expectedKey = process.env.API_KEY;

        if (!expectedKey) {
            throw new UnauthorizedException('API_KEY is not configured on the server');
        }

        if (!providedKey || providedKey !== expectedKey) {
            throw new UnauthorizedException('Invalid or missing API key');
        }

        return true;
    }
}