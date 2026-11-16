import { Logger } from '@nestjs/common';

const logger = new Logger('FaultDb');

export const FAULT_DB_HANG_MS = 10_000;

/**
 * Runs one database query. With FAULT_DB=unreachable it behaves like a
 * database that never answers: it waits 10 s and then fails. The variable is
 * read on every call, so the app still starts when it is active.
 */
export async function dbQuery<T>(query: () => Promise<T>): Promise<T> {
    if (process.env.FAULT_DB === 'unreachable') {
        logger.warn('FAULT_DB active');
        await new Promise((resolve) => setTimeout(resolve, FAULT_DB_HANG_MS));
        throw new Error('FAULT_DB: database unreachable');
    }
    return query();
}