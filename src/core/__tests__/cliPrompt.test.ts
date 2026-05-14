import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CliPrompt } from '../cliPrompt.js';
import * as utils from '../../utils/index.js';

vi.mock('../../utils/index.js', async () => {
  const actual = await vi.importActual('../../utils/index.js');
  return {
    ...actual,
    select: vi.fn(),
    input: vi.fn(),
  };
});

describe('CliPrompt', () => {
  let cliPrompt: CliPrompt;

  beforeEach(() => {
    cliPrompt = new CliPrompt();
    vi.clearAllMocks();
  });

  describe('promptFileType', () => {
    it('should return the selected file type', async () => {
      vi.mocked(utils.select).mockResolvedValue('series');
      const result = await cliPrompt.promptFileType();
      expect(result).toBe('series');
      expect(utils.select).toHaveBeenCalled();
    });
  });

  describe('promptSection', () => {
    it('should return section for series', async () => {
      vi.mocked(utils.select).mockResolvedValue('to-see');
      const result = await cliPrompt.promptSection('series');
      expect(result).toBe('to-see');
    });

    it('should return section for ww2', async () => {
      vi.mocked(utils.select).mockResolvedValue('seen');
      const result = await cliPrompt.promptSection('ww2');
      expect(result).toBe('seen');
    });

    it('should return section for movie', async () => {
      vi.mocked(utils.select).mockResolvedValue('israel');
      const result = await cliPrompt.promptSection('movie');
      expect(result).toBe('israel');
    });
  });

  describe('promptName', () => {
    it('should return trimmed name', async () => {
      vi.mocked(utils.input).mockResolvedValue('  Inception  ');
      const result = await cliPrompt.promptName();
      expect(result).toBe('Inception');
    });

    it('should validate name is not empty', async () => {
      vi.mocked(utils.input).mockImplementation(async (config) => {
        const validate = (config as any).validate!;
        expect(validate('')).toBe('Name cannot be empty. Please enter a name.');
        expect(validate('  ')).toBe(
          'Name cannot be empty. Please enter a name.'
        );
        expect(validate('Valid Name')).toBe(true);
        return 'Valid Name';
      });
      await cliPrompt.promptName();
    });

    it('should validate name length', async () => {
      vi.mocked(utils.input).mockImplementation(async (config) => {
        const validate = (config as any).validate!;
        expect(validate('a'.repeat(1001))).toBe(
          'Name is too long. Maximum 1000 characters allowed.'
        );
        return 'Valid Name';
      });
      await cliPrompt.promptName();
    });
  });

  describe('promptYear', () => {
    it('should return year as number', async () => {
      vi.mocked(utils.input).mockResolvedValue('2024');
      const result = await cliPrompt.promptYear();
      expect(result).toBe(2024);
    });

    it('should validate year', async () => {
      vi.mocked(utils.input).mockImplementation(async (config) => {
        const validate = (config as any).validate!;
        expect(validate('abc')).toBe('Year must be a number');
        expect(validate('1899')).toBe('Year must be between 1900 and 2100');
        expect(validate('2101')).toBe('Year must be between 1900 and 2100');
        expect(validate('2024')).toBe(true);
        return '2024';
      });
      await cliPrompt.promptYear();
    });
  });

  describe('promptSeasons', () => {
    it('should return parsed seasons', async () => {
      vi.mocked(utils.input).mockResolvedValue('1, 2, 3');
      const result = await cliPrompt.promptSeasons();
      expect(result).toEqual([1, 2, 3]);
    });

    it('should validate seasons input', async () => {
      vi.mocked(utils.input).mockImplementation(async (config) => {
        const validate = (config as any).validate!;
        expect(validate('1, 2, a')).toBe(
          'Seasons must contain only numbers and commas'
        );
        expect(validate('-1, 2')).toBe('Seasons cannot be negative numbers');
        expect(validate('0, 1')).toBe(
          'Seasons must be positive numbers (greater than 0)'
        );
        expect(validate('1001')).toBe(
          'Season numbers must be between 1 and 1000'
        );
        expect(validate('1, 2, 3')).toBe(true);
        expect(validate('')).toBe(true);
        return '1, 2';
      });
      await cliPrompt.promptSeasons();
    });
  });

  describe('promptHebrew', () => {
    it('should return trimmed Hebrew name', async () => {
      vi.mocked(utils.input).mockResolvedValue('  מראה שחורה  ');
      const result = await cliPrompt.promptHebrew();
      expect(result).toBe('מראה שחורה');
    });

    it('should validate Hebrew text', async () => {
      vi.mocked(utils.input).mockImplementation(async (config) => {
        const validate = (config as any).validate!;
        expect(validate('English')).toBe(
          'Hebrew name must contain only Hebrew characters, numbers, and punctuation'
        );
        expect(validate('מראה שחורה')).toBe(true);
        expect(validate('')).toBe(true);
        return 'מראה שחורה';
      });
      await cliPrompt.promptHebrew();
    });
  });

  describe('promptAddMore', () => {
    it('should return boolean for series', async () => {
      vi.mocked(utils.select).mockResolvedValue(true);
      const result = await cliPrompt.promptAddMore('series');
      expect(result).toBe(true);
    });

    it('should return boolean for movie', async () => {
      vi.mocked(utils.select).mockResolvedValue(false);
      const result = await cliPrompt.promptAddMore('movie');
      expect(result).toBe(false);
    });

    it('should return boolean for ww2', async () => {
      vi.mocked(utils.select).mockResolvedValue(true);
      const result = await cliPrompt.promptAddMore('ww2');
      expect(result).toBe(true);
    });
  });

  describe('promptConfirmWrite', () => {
    it('should return confirmation result', async () => {
      vi.mocked(utils.select).mockResolvedValue(true);
      const result = await cliPrompt.promptConfirmWrite();
      expect(result).toBe(true);
    });
  });

  describe('promptFileTypeAndSection', () => {
    it('should prompt for both file type and section', async () => {
      vi.mocked(utils.select)
        .mockResolvedValueOnce('movie')
        .mockResolvedValueOnce('to-see');

      const result = await cliPrompt.promptFileTypeAndSection();
      expect(result).toEqual({ fileType: 'movie', section: 'to-see' });
    });
  });
});
