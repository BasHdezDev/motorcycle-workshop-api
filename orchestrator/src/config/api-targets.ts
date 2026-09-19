export interface ApiTarget {
    baseUrl: string;
    apiKey: string;
    randomPath: string;
    metricsPath: string;
}

export function resolveTarget(api: string): ApiTarget | null {
    switch (api) {
        case 'inventory':
            return {
                baseUrl: process.env.API_A_URL!,
                apiKey: process.env.API_A_KEY!,
                randomPath: '/v2/interop/random', // OJO: con /v2, confirmado por API A
                metricsPath: '/metrics',           // sin /v2
            };
        case 'orders':
            return {
                baseUrl: process.env.API_B_URL!,
                apiKey: process.env.API_B_KEY!,
                randomPath: '/api/v2/service-orders/interop/random',
                metricsPath: '/metrics',
            };
        default:
            return null;
    }
}