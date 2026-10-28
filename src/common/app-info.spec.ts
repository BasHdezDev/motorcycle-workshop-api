import { getAppInfo } from './app-info';

describe('getAppInfo', () => {
  const original = process.env.APP_TRACK;

  afterEach(() => {
    if (original === undefined) delete process.env.APP_TRACK;
    else process.env.APP_TRACK = original;
  });

  it.each(['stable', 'canary'])('accepts the %s track', (track) => {
    process.env.APP_TRACK = track;
    expect(getAppInfo().track).toBe(track);
  });

  it('falls back to unknown for missing or invalid values', () => {
    delete process.env.APP_TRACK;
    expect(getAppInfo().track).toBe('unknown');
    process.env.APP_TRACK = 'hacked';
    expect(getAppInfo().track).toBe('unknown');
  });

  it('reads the version from package.json', () => {
    expect(getAppInfo().version).toMatch(/^\d+\.\d+\.\d+/);
  });
});