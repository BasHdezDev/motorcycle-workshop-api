export class DbTimeoutError extends Error { }

/** Rejects after `ms`. The losing promise is silenced so a late rejection cannot crash Node. */
export function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(
            () => reject(new DbTimeoutError(`database read exceeded ${ms} ms`)),
            ms,
        );
    });
    work.catch(() => undefined);
    return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}