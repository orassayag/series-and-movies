import { describe, it, expect, vi, beforeEach } from 'vitest';
import inquirer from 'inquirer';
import { CliPrompt } from '../cliPrompt.js';

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

describe('CliPrompt', () => {
  let cliPrompt: CliPrompt;

  beforeEach(() => {
    cliPrompt = new CliPrompt();
    vi.clearAllMocks();
  });

  describe('promptFileType', () => {
    it('should return the selected file type', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ fileType: 'series' });
      const result = await cliPrompt.promptFileType();
      expect(result).toBe('series');
      expect(inquirer.prompt).toHaveBeenCalled();
    });
  });

  describe('promptSection', () => {
    it('should return section for series', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ section: 'to-see' });
      const result = await cliPrompt.promptSection('series');
      expect(result).toBe('to-see');
    });

    it('should return section for ww2', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ section: 'seen' });
      const result = await cliPrompt.promptSection('ww2');
      expect(result).toBe('seen');
    });

    it('should return section for movie', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ section: 'israel' });
      const result = await cliPrompt.promptSection('movie');
      expect(result).toBe('israel');
    });
  });

  describe('promptName', () => {
    it('should return trimmed name', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ name: '  Inception  ' });
      const result = await cliPrompt.promptName();
      expect(result).toBe('Inception');
    });

    it('should validate name is not empty', async () => {
      vi.mocked(inquirer.prompt).mockImplementation(async (questions) => {
        const q = questions as Array<{ validate: (input: string) => string | boolean }>;
        const validate = q[0].validate!;
        expect(validate('')).toBe('Name cannot be empty. Please enter a name.');
        expect(validate('  ')).toBe('Name cannot be empty. Please enter a name.');
        expect(validate('Valid Name')).toBe(true);
        return { name: 'Valid Name' };
      });
      await cliPrompt.promptName();
    });

    it('should validate name length', async () => {
      vi.mocked(inquirer.prompt).mockImplementation(async (questions) => {
        const q = questions as Array<{ validate: (input: string) => string | boolean }>;
        const validate = q[0].validate!;
        expect(validate('a'.repeat(1001))).toBe(
          'Name is too long. Maximum 1000 characters allowed.'
        );
        return { name: 'Valid Name' };
      });
      await cliPrompt.promptName();
    });
  });

  describe('promptYear', () => {
    it('should return year as number', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ year: '2024' });
      const result = await cliPrompt.promptYear();
      expect(result).toBe(2024);
    });

    it('should validate year', async () => {
      vi.mocked(inquirer.prompt).mockImplementation(async (questions) => {
        const q = questions as Array<{ validate: (input: string) => string | boolean }>;
        const validate = q[0].validate!;
        expect(validate('abc')).toBe('Year must be a number');
        expect(validate('1899')).toBe('Year must be between 1900 and 2100');
        expect(validate('2101')).toBe('Year must be between 1900 and 2100');
        expect(validate('2024')).toBe(true);
        return { year: '2024' };
      });
      await cliPrompt.promptYear();
    });
  });

  describe('promptSeasons', () => {
    it('should return parsed seasons', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ seasonsInput: '1, 2, 3' });
      const result = await cliPrompt.promptSeasons();
      expect(result).toEqual([1, 2, 3]);
    });

    it('should validate seasons input', async () => {
      vi.mocked(inquirer.prompt).mockImplementation(async (questions) => {
        const q = questions as Array<{ validate: (input: string) => string | boolean }>;
        const validate = q[0].validate!;
        expect(validate('1, 2, a')).toBe('Seasons must contain only numbers and commas');
        expect(validate('-1, 2')).toBe('Seasons cannot be negative numbers');
        expect(validate('0, 1')).toBe('Seasons must be positive numbers (greater than 0)');
        expect(validate('1001')).toBe('Season numbers must be between 1 and 1000');
        expect(validate('1, 2, 3')).toBe(true);
        expect(validate('')).toBe(true);
        return { seasonsInput: '1, 2' };
      });
      await cliPrompt.promptSeasons();
    });
  });

  describe('promptHebrew', () => {
    it('should return trimmed Hebrew name', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ hebrew: '  מראה שחורה  ' });
      const result = await cliPrompt.promptHebrew();
      expect(result).toBe('מראה שחורה');
    });

    it('should validate Hebrew text', async () => {
      vi.mocked(inquirer.prompt).mockImplementation(async (questions) => {
        const q = questions as Array<{ validate: (input: string) => string | boolean }>;
        const validate = q[0].validate!;
        expect(validate('English')).toBe(
          'Hebrew name must contain only Hebrew characters, numbers, and punctuation'
        );
        expect(validate('מראה שחורה')).toBe(true);
        expect(validate('')).toBe(true);
        return { hebrew: 'מראה שחורה' };
      });
      await cliPrompt.promptHebrew();
    });
  });

  describe('promptAddMore', () => {
    it('should return boolean for series', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ addMore: true });
      const result = await cliPrompt.promptAddMore('series');
      expect(result).toBe(true);
    });

    it('should return boolean for movie', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ addMore: false });
      const result = await cliPrompt.promptAddMore('movie');
      expect(result).toBe(false);
    });

    it('should return boolean for ww2', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ addMore: true });
      const result = await cliPrompt.promptAddMore('ww2');
      expect(result).toBe(true);
    });
  });

  describe('promptConfirmWrite', () => {
    it('should return confirmation result', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ confirm: true });
      const result = await cliPrompt.promptConfirmWrite();
      expect(result).toBe(true);
    });
  });

  describe('promptFileTypeAndSection', () => {
    it('should prompt for both file type and section', async () => {
      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({ fileType: 'movie' })
        .mockResolvedValueOnce({ section: 'to-see' });

      const result = await cliPrompt.promptFileTypeAndSection();
      expect(result).toEqual({ fileType: 'movie', section: 'to-see' });
    });
  });
});
