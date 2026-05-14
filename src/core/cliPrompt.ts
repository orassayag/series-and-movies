import { FileType, SectionType } from '../types';
import {
  validateNonEmpty,
  parseSeasonInput,
  isValidHebrew,
  select,
  input,
} from '../utils';

export class CliPrompt {
  async promptFileTypeAndSection(): Promise<{
    fileType: FileType;
    section: SectionType;
  }> {
    const fileType = await this.promptFileType();
    const section = await this.promptSection(fileType);
    return { fileType, section };
  }
  async promptFileType(): Promise<FileType> {
    return await select<FileType>({
      message: 'What do you want to add?',
      choices: [
        { name: 'Series', value: 'series' },
        { name: 'Movie', value: 'movie' },
        { name: 'WW2 Movie', value: 'ww2' },
      ],
    });
  }
  async promptSection(fileType: FileType): Promise<SectionType> {
    if (fileType === 'series') {
      return await select<SectionType>({
        message: 'Select section:',
        choices: [
          { name: 'To see', value: 'to-see' },
          { name: 'Seen', value: 'seen' },
          { name: 'Others to see', value: 'others' },
          { name: 'Cancel', value: 'cancel' },
        ],
      });
    }
    if (fileType === 'ww2') {
      return await select<SectionType>({
        message: 'Select section:',
        choices: [
          { name: 'To see', value: 'to-see' },
          { name: 'Seen', value: 'seen' },
          { name: 'Cancel', value: 'cancel' },
        ],
      });
    }
    return await select<SectionType>({
      message: 'Select section:',
      choices: [
        { name: 'To see', value: 'to-see' },
        { name: 'Seen', value: 'seen' },
        { name: 'Israel', value: 'israel' },
      ],
    });
  }
  async promptName(): Promise<string> {
    const name = await input({
      message: 'Name:',
      validate: (value: string) => {
        if (!validateNonEmpty(value)) {
          return 'Name cannot be empty. Please enter a name.';
        }
        if (value.trim().length > 1000) {
          return 'Name is too long. Maximum 1000 characters allowed.';
        }
        return true;
      },
    });
    return name.trim();
  }
  async promptYear(): Promise<number> {
    const year = await input({
      message: 'Year:',
      validate: (value: string) => {
        const yearNum = parseInt(value, 10);
        if (isNaN(yearNum)) {
          return 'Year must be a number';
        }
        if (yearNum < 1900 || yearNum > 2100) {
          return 'Year must be between 1900 and 2100';
        }
        return true;
      },
    });
    return parseInt(year, 10);
  }
  async promptSeasons(): Promise<number[]> {
    const seasonsInputStr = await input({
      message: 'Seasons (Format: 1,2,3,4):',
      initial: '',
      validate: (value: string) => {
        if (!value || !value.trim()) {
          return true;
        }
        const cleaned = value.trim();
        if (!/^[\d,\s-]+$/.test(cleaned)) {
          return 'Seasons must contain only numbers and commas';
        }
        const parts = cleaned.split(',');
        const seasons = parts
          .map((part) => parseInt(part.trim(), 10))
          .filter((num) => !isNaN(num));
        const negativeSeasons = seasons.filter((num) => num < 0);
        if (negativeSeasons.length > 0) {
          return 'Seasons cannot be negative numbers';
        }
        const zeroSeasons = seasons.filter((num) => num === 0);
        if (zeroSeasons.length > 0) {
          return 'Seasons must be positive numbers (greater than 0)';
        }
        const tooLargeSeasons = seasons.filter((num) => num > 1000);
        if (tooLargeSeasons.length > 0) {
          return 'Season numbers must be between 1 and 1000';
        }
        return true;
      },
    });
    return parseSeasonInput(seasonsInputStr);
  }
  async promptHebrew(): Promise<string> {
    const hebrew = await input({
      message: 'Hebrew name (optional):',
      initial: '',
      validate: (value: string) => {
        if (!value || !value.trim()) {
          return true;
        }
        if (!isValidHebrew(value)) {
          return 'Hebrew name must contain only Hebrew characters, numbers, and punctuation';
        }
        return true;
      },
    });
    return hebrew.trim();
  }
  async promptAddMore(fileType: FileType): Promise<boolean> {
    const fileTypeLabel =
      fileType === 'series'
        ? 'Series'
        : fileType === 'movie'
          ? 'Movies'
          : 'WW2 movies';
    return await select<boolean>({
      message: `Would you like to add more ${fileTypeLabel}?`,
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
    });
  }
  async promptConfirmWrite(): Promise<boolean> {
    return await select<boolean>({
      message: 'Write these changes to file?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No (discard all changes)', value: false },
      ],
    });
  }
}
