import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sync } from '../sync.js';
import { FileScanner, FileWriter, DuplicateRemover } from '../../core';
import { settings } from '../../settings.js';

vi.mock('../../core', () => ({
  FileScanner: vi.fn().mockImplementation(() => ({
    scanFile: vi.fn().mockResolvedValue({ sections: new Map() }),
  })),
  FileWriter: vi.fn().mockImplementation(() => ({
    writeFile: vi.fn().mockResolvedValue(undefined),
  })),
  DuplicateRemover: vi.fn().mockImplementation(() => ({
    removeDuplicates: vi.fn().mockReturnValue({
      cleanedFile: { sections: new Map() },
      removedEntries: [],
    }),
  })),
}));

vi.mock('../../utils', async () => {
  const actual = await vi.importActual('../../utils');
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
  });

  it('should sync enabled files', async () => {
    await sync();

    const scannerInstance = vi.mocked(FileScanner).mock.results[0].value;
    expect(scannerInstance.scanFile).toHaveBeenCalledTimes(2); // series and movies
    expect(scannerInstance.scanFile).toHaveBeenCalledWith('series.txt');
    expect(scannerInstance.scanFile).toHaveBeenCalledWith('movies.txt');

    const removerInstance = vi.mocked(DuplicateRemover).mock.results[0].value;
    expect(removerInstance.removeDuplicates).toHaveBeenCalledTimes(2);

    const writerInstance = vi.mocked(FileWriter).mock.results[0].value;
    expect(writerInstance.writeFile).toHaveBeenCalledTimes(2);
  });

  it('should log removed duplicates', async () => {
    const removerInstanceMock = {
      removeDuplicates: vi.fn().mockReturnValue({
        cleanedFile: { sections: new Map() },
        removedEntries: [
          { name: 'Dup', year: 2024, seasons: [], section: 'seen', reason: 'duplicate-in-section' },
        ],
      }),
    };
    vi.mocked(DuplicateRemover).mockImplementation(
      () => removerInstanceMock as unknown as DuplicateRemover
    );

    await sync();

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('DUPLICATES REMOVED: 2'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Dup'));
  });

  it('should handle no files to sync', async () => {
    settings.syncSeries = false;
    settings.syncMovies = false;
    settings.syncWW2 = false;

    await sync();

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No files to sync'));
  });

  it('should handle errors', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    vi.mocked(FileScanner).mockImplementationOnce(
      () =>
        ({
          scanFile: vi.fn().mockRejectedValue(new Error('Scan failed')),
        }) as unknown as FileScanner
    );

    await sync();

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error: Scan failed'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
