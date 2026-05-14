import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sync } from '../sync.js';
import { FileScanner, FileWriter, DuplicateRemover } from '../../core/index.js';
import { settings } from '../../settings.js';

vi.mock('../../core/index.js', () => {
  const FileScanner = vi.fn();
  FileScanner.prototype.scanFile = vi.fn();

  const FileWriter = vi.fn();
  FileWriter.prototype.writeFile = vi.fn();

  const DuplicateRemover = vi.fn();
  DuplicateRemover.prototype.removeDuplicates = vi.fn();

  return {
    FileScanner,
    FileWriter,
    DuplicateRemover,
  };
});

vi.mock('../../utils/index.js', async () => {
  const actual = await vi.importActual('../../utils/index.js');
  return {
    ...actual,
    getOutputPath: vi.fn((p) => p),
    ensureDirectoryExists: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('../../settings.js', () => ({
  settings: {
    seriesFilePath: 'series.txt',
    moviesFilePath: 'movies.txt',
    ww2FilePath: 'ww2.txt',
    syncSeries: true,
    syncMovies: true,
    syncWW2: false,
  },
}));

describe('sync script', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    settings.syncSeries = true;
    settings.syncMovies = true;
    settings.syncWW2 = false;

    vi.mocked(FileScanner.prototype.scanFile).mockResolvedValue({
      sections: new Map(),
    });
    vi.mocked(FileWriter.prototype.writeFile).mockResolvedValue(undefined);
    vi.mocked(DuplicateRemover.prototype.removeDuplicates).mockReturnValue({
      cleanedFile: { sections: new Map() },
      removedEntries: [],
    });
  });

  it('should sync enabled files', async () => {
    await sync();

    expect(FileScanner.prototype.scanFile).toHaveBeenCalledTimes(2); // series and movies
    expect(FileScanner.prototype.scanFile).toHaveBeenCalledWith('series.txt');
    expect(FileScanner.prototype.scanFile).toHaveBeenCalledWith('movies.txt');

    expect(DuplicateRemover.prototype.removeDuplicates).toHaveBeenCalledTimes(
      2
    );
    expect(FileWriter.prototype.writeFile).toHaveBeenCalledTimes(2);
  });

  it('should log removed duplicates', async () => {
    vi.mocked(DuplicateRemover.prototype.removeDuplicates).mockReturnValue({
      cleanedFile: { sections: new Map() },
      removedEntries: [
        {
          name: 'Dup',
          hebrew: 'כפול',
          year: 2024,
          seasons: [],
          section: 'seen',
          reason: 'duplicate-in-section',
        },
      ],
    });

    await sync();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('DUPLICATES REMOVED: 2')
    );
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Dup'));
  });

  it('should handle no files to sync', async () => {
    settings.syncSeries = false;
    settings.syncMovies = false;
    settings.syncWW2 = false;

    await sync();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('No files to sync')
    );
  });

  it('should handle errors', async () => {
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    vi.mocked(FileScanner.prototype.scanFile).mockRejectedValueOnce(
      new Error('Scan failed')
    );

    await sync();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error: Scan failed')
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
