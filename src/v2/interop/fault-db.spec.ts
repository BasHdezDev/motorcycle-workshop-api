import { dbQuery } from './fault-db';

describe('dbQuery', () => {
    afterEach(() => {
        delete process.env.FAULT_DB;
        jest.useRealTimers();
    });

    it('runs the query untouched when FAULT_DB is not set', async () => {
        const query = jest.fn().mockResolvedValue(7);
        await expect(dbQuery(query)).resolves.toBe(7);
        expect(query).toHaveBeenCalledTimes(1);
    });

    it('ignores any FAULT_DB value other than unreachable', async () => {
        process.env.FAULT_DB = 'off';
        const query = jest.fn().mockResolvedValue(1);
        await expect(dbQuery(query)).resolves.toBe(1);
    });

    it('hangs 10 s and then fails without running the query', async () => {
        jest.useFakeTimers();
        process.env.FAULT_DB = 'unreachable';
        const query = jest.fn();

        let settled = false;
        const result = dbQuery(query);
        const assertion = expect(result).rejects.toThrow('FAULT_DB');
        result.catch(() => { settled = true; });

        await jest.advanceTimersByTimeAsync(9_999);
        expect(settled).toBe(false);

        await jest.advanceTimersByTimeAsync(1);
        await assertion;
        expect(settled).toBe(true);
        expect(query).not.toHaveBeenCalled();
    });

    it('is read on every call, not at startup', async () => {
        const query = jest.fn().mockResolvedValue('ok');
        await expect(dbQuery(query)).resolves.toBe('ok');

        jest.useFakeTimers();
        process.env.FAULT_DB = 'unreachable';
        const failing = expect(dbQuery(query)).rejects.toThrow('FAULT_DB');
        await jest.advanceTimersByTimeAsync(10_000);
        await failing;

        delete process.env.FAULT_DB;
        jest.useRealTimers();
        await expect(dbQuery(query)).resolves.toBe('ok');
    });
});