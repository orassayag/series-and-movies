import { describe, it, expect } from 'vitest';
import { settings } from '../settings.js';

describe('settings', () => {
  it('should have the required file paths', () => {
    expect(settings.seriesFilePath).toBeDefined();
    expect(settings.moviesFilePath).toBeDefined();
    expect(settings.ww2FilePath).toBeDefined();
  });

  it('should have sync flags', () => {
    expect(typeof settings.syncSeries).toBe('boolean');
    expect(typeof settings.syncMovies).toBe('boolean');
    expect(typeof settings.syncWW2).toBe('boolean');
  });
});
