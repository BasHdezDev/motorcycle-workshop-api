import * as packageJson from '../../package.json';

export type AppTrack = 'stable' | 'canary' | 'unknown';

// Version comes from package.json (baked into the image) and the track from
// APP_TRACK (baked in at build time). Both are server-side facts: nothing
// the client sends can change them. Anything unexpected becomes 'unknown'
// so a misconfigured deploy is visible instead of silently claiming 'stable'.
export function getAppInfo(): { version: string; track: AppTrack } {
  const track = process.env.APP_TRACK;
  return {
    version: packageJson.version,
    track: track === 'stable' || track === 'canary' ? track : 'unknown',
  };
}