import { describe, it, expect, vi, beforeEach } from 'vitest';
import { add } from '../add.js';
import {
  FileScanner,
  CliPrompt,
  EntryManager,
  FileWriter,
} from '../../core/index.js';

vi.mock('../../core/index.js', () => {
  const FileScanner = vi.fn();
  FileScanner.prototype.scanFile = vi.fn();

  const CliPrompt = vi.fn();
  CliPrompt.prototype.promptFileType = vi.fn();
  CliPrompt.prototype.promptSection = vi.fn();
  CliPrompt.prototype.promptName = vi.fn();
  CliPrompt.prototype.promptYear = vi.fn();
  CliPrompt.prototype.promptSeasons = vi.fn();
  CliPrompt.prototype.promptHebrew = vi.fn();
  CliPrompt.prototype.promptAddMore = vi.fn();
  CliPrompt.prototype.promptConfirmWrite = vi.fn();

  const EntryManager = vi.fn();
  EntryManager.prototype.addOrUpdateEntry = vi.fn();

  const FileWriter = vi.fn();
  FileWriter.prototype.writeFile = vi.fn();

  return {
    FileScanner,
    CliPrompt,
    EntryManager,
    FileWriter,
  };
});

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

    vi.mocked(FileScanner.prototype.scanFile).mockResolvedValue({
      sections: new Map(),
    });
    vi.mocked(CliPrompt.prototype.promptFileType).mockResolvedValue('series');
    vi.mocked(CliPrompt.prototype.promptSection).mockResolvedValue('to-see');
    vi.mocked(CliPrompt.prototype.promptName).mockResolvedValue('New Series');
    vi.mocked(CliPrompt.prototype.promptSeasons).mockResolvedValue([1]);
    vi.mocked(CliPrompt.prototype.promptHebrew).mockResolvedValue('');
    vi.mocked(CliPrompt.prototype.promptAddMore).mockResolvedValue(false);
    vi.mocked(CliPrompt.prototype.promptConfirmWrite).mockResolvedValue(true);
    vi.mocked(FileWriter.prototype.writeFile).mockResolvedValue(undefined);
  });

  it('should add a series successfully', async () => {
    await add();

    expect(FileScanner.prototype.scanFile).toHaveBeenCalled();
    expect(CliPrompt.prototype.promptFileType).toHaveBeenCalled();
    expect(CliPrompt.prototype.promptName).toHaveBeenCalled();
    expect(EntryManager.prototype.addOrUpdateEntry).toHaveBeenCalled();
    expect(FileWriter.prototype.writeFile).toHaveBeenCalled();
  });

  it('should handle cancel in section prompt', async () => {
    vi.mocked(CliPrompt.prototype.promptSection).mockResolvedValue('cancel');

    await add();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('No Series were added')
    );
  });

  it('should handle discard changes', async () => {
    vi.mocked(CliPrompt.prototype.promptFileType).mockResolvedValue('movie');
    vi.mocked(CliPrompt.prototype.promptConfirmWrite).mockResolvedValue(false);

    await add();

    expect(FileWriter.prototype.writeFile).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Changes discarded')
    );
  });

  it('should handle errors during adding', async () => {
    vi.mocked(CliPrompt.prototype.promptName).mockRejectedValue(
      new Error('Prompt failed')
    );

    await add();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error: Prompt failed')
    );
  });

  it('should handle movie addition with year from existing entry', async () => {
    const existingFile = {
      sections: new Map([
        [
          'seen',
          {
            header: 'SEEN:',
            entries: [
              { name: 'Inception 2010', year: 2010, seasons: [], hebrew: '' },
            ],
          },
        ],
      ]),
    };
    vi.mocked(FileScanner.prototype.scanFile).mockResolvedValue(existingFile);
    vi.mocked(CliPrompt.prototype.promptFileType).mockResolvedValue('movie');
    vi.mocked(CliPrompt.prototype.promptName).mockResolvedValue('Inception');

    await add();

    expect(CliPrompt.prototype.promptYear).not.toHaveBeenCalled();
    expect(EntryManager.prototype.addOrUpdateEntry).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: 'Inception 2010',
        year: 2010,
      })
    );
  });

  it('should throw error if entry already added in same session', async () => {
    vi.mocked(CliPrompt.prototype.promptName).mockResolvedValue('Duplicate');
    vi.mocked(CliPrompt.prototype.promptAddMore)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

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
            entries: [
              { name: 'Inception 2010', year: 2010, seasons: [], hebrew: '' },
            ],
          },
        ],
      ]),
    };
    vi.mocked(FileScanner.prototype.scanFile).mockResolvedValue(existingFile);
    vi.mocked(CliPrompt.prototype.promptFileType).mockResolvedValue('movie');
    vi.mocked(CliPrompt.prototype.promptName).mockResolvedValue('Inception');
    vi.mocked(CliPrompt.prototype.promptYear).mockResolvedValue(2010);

    await add();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('already exists in to-see section')
    );
  });
});
