import { describe, it, expect, vi, beforeEach } from 'vitest';
import { add } from '../add.js';
import { FileScanner, CliPrompt, EntryManager, FileWriter } from '../../core';

vi.mock('../../core', () => ({
  FileScanner: vi.fn().mockImplementation(() => ({
    scanFile: vi.fn().mockResolvedValue({ sections: new Map() }),
  })),
  CliPrompt: vi.fn().mockImplementation(() => ({
    promptFileType: vi.fn().mockResolvedValue('series'),
    promptSection: vi.fn().mockResolvedValue('to-see'),
    promptName: vi.fn().mockResolvedValue('New Series'),
    promptSeasons: vi.fn().mockResolvedValue([1]),
    promptHebrew: vi.fn().mockResolvedValue(''),
    promptAddMore: vi.fn().mockResolvedValue(false),
    promptConfirmWrite: vi.fn().mockResolvedValue(true),
  })),
  EntryManager: vi.fn().mockImplementation(() => ({
    addOrUpdateEntry: vi.fn(),
  })),
  FileWriter: vi.fn().mockImplementation(() => ({
    writeFile: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../../settings.js', () => ({
  settings: {
    seriesFilePath: 'series.txt',
    moviesFilePath: 'movies.txt',
    ww2FilePath: 'ww2.txt',
  },
}));

describe('add script', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should add a series successfully', async () => {
    await add();

    const scannerInstance = vi.mocked(FileScanner).mock.results[0].value;
    expect(scannerInstance.scanFile).toHaveBeenCalled();

    const promptInstance = vi.mocked(CliPrompt).mock.results[0].value;
    expect(promptInstance.promptFileType).toHaveBeenCalled();
    expect(promptInstance.promptName).toHaveBeenCalled();

    const managerInstance = vi.mocked(EntryManager).mock.results[0].value;
    expect(managerInstance.addOrUpdateEntry).toHaveBeenCalled();

    const writerInstance = vi.mocked(FileWriter).mock.results[0].value;
    expect(writerInstance.writeFile).toHaveBeenCalled();
  });

  it('should handle cancel in section prompt', async () => {
    const promptInstanceMock = {
      promptFileType: vi.fn().mockResolvedValue('series'),
      promptSection: vi.fn().mockResolvedValue('cancel'),
      promptAddMore: vi.fn().mockResolvedValue(false),
      promptConfirmWrite: vi.fn().mockResolvedValue(false),
    };
    vi.mocked(CliPrompt).mockImplementation(() => promptInstanceMock as unknown as CliPrompt);

    await add();

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No Series were added'));
  });

  it('should handle discard changes', async () => {
    const promptInstanceMock = {
      promptFileType: vi.fn().mockResolvedValue('movie'),
      promptSection: vi.fn().mockResolvedValue('to-see'),
      promptName: vi.fn().mockResolvedValue('Movie'),
      promptYear: vi.fn().mockResolvedValue(2024),
      promptHebrew: vi.fn().mockResolvedValue(''),
      promptAddMore: vi.fn().mockResolvedValue(false),
      promptConfirmWrite: vi.fn().mockResolvedValue(false),
    };
    vi.mocked(CliPrompt).mockImplementation(() => promptInstanceMock as unknown as CliPrompt);

    await add();

    expect(FileWriter).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Changes discarded'));
  });

  it('should handle errors during adding', async () => {
    const promptInstanceMock = {
      promptFileType: vi.fn().mockResolvedValue('series'),
      promptSection: vi.fn().mockResolvedValue('to-see'),
      promptName: vi.fn().mockRejectedValue(new Error('Prompt failed')),
      promptAddMore: vi.fn().mockResolvedValue(false),
      promptConfirmWrite: vi.fn().mockResolvedValue(false),
    };
    vi.mocked(CliPrompt).mockImplementation(() => promptInstanceMock as unknown as CliPrompt);

    await add();

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error: Prompt failed'));
  });

  it('should handle movie addition with year from existing entry', async () => {
    const existingFile = {
      sections: new Map([
        [
          'seen',
          {
            header: 'SEEN:',
            entries: [{ name: 'Inception 2010', year: 2010, seasons: [], hebrew: '' }],
          },
        ],
      ]),
    };
    vi.mocked(FileScanner).mockImplementation(
      () =>
        ({
          scanFile: vi.fn().mockResolvedValue(existingFile),
        }) as unknown as FileScanner
    );

    const promptInstanceMock = {
      promptFileType: vi.fn().mockResolvedValue('movie'),
      promptSection: vi.fn().mockResolvedValue('to-see'),
      promptName: vi.fn().mockResolvedValue('Inception'),
      promptYear: vi.fn(), // Should NOT be called
      promptHebrew: vi.fn().mockResolvedValue(''),
      promptAddMore: vi.fn().mockResolvedValue(false),
      promptConfirmWrite: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(CliPrompt).mockImplementation(() => promptInstanceMock as unknown as CliPrompt);

    await add();

    expect(promptInstanceMock.promptYear).not.toHaveBeenCalled();
    const managerInstance = vi.mocked(EntryManager).mock.results[0].value;
    expect(managerInstance.addOrUpdateEntry).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: 'Inception 2010',
        year: 2010,
      })
    );
  });

  it('should throw error if entry already added in same session', async () => {
    const promptInstanceMock = {
      promptFileType: vi.fn().mockResolvedValue('series'),
      promptSection: vi.fn().mockResolvedValue('to-see'),
      promptName: vi.fn().mockResolvedValue('Duplicate'),
      promptSeasons: vi.fn().mockResolvedValue([1]),
      promptHebrew: vi.fn().mockResolvedValue(''),
      promptAddMore: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
      promptConfirmWrite: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(CliPrompt).mockImplementation(() => promptInstanceMock as unknown as CliPrompt);

    await add();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('already added to to-see section in this session')
    );
  });

  it('should throw error if movie already exists in target section', async () => {
    const existingFile = {
      sections: new Map([
        [
          'to-see',
          {
            header: 'TO SEE:',
            entries: [{ name: 'Inception 2010', year: 2010, seasons: [], hebrew: '' }],
          },
        ],
      ]),
    };
    vi.mocked(FileScanner).mockImplementation(
      () =>
        ({
          scanFile: vi.fn().mockResolvedValue(existingFile),
        }) as unknown as FileScanner
    );

    const promptInstanceMock = {
      promptFileType: vi.fn().mockResolvedValue('movie'),
      promptSection: vi.fn().mockResolvedValue('to-see'),
      promptName: vi.fn().mockResolvedValue('Inception'),
      promptYear: vi.fn().mockResolvedValue(2010),
      promptHebrew: vi.fn().mockResolvedValue(''),
      promptAddMore: vi.fn().mockResolvedValue(false),
      promptConfirmWrite: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(CliPrompt).mockImplementation(() => promptInstanceMock as unknown as CliPrompt);

    await add();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('already exists in to-see section')
    );
  });
});
