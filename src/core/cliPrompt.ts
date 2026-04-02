import inquirer from 'inquirer';
import { FileType, SectionType } from '../types';
import { validateNonEmpty, parseSeasonInput, isValidHebrew } from '../utils';

export class CliPrompt {
  async promptFileTypeAndSection(): Promise<{ fileType: FileType; section: SectionType }> {
    const fileType = await this.promptFileType();
    const section = await this.promptSection(fileType);
    return { fileType, section };
  }
  async promptFileType(): Promise<FileType> {
    const { fileType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'fileType',
        message: 'What do you want to add?',
        choices: [
          { name: 'Series', value: 'series' },
          { name: 'Movie', value: 'movie' },
          { name: 'WW2 Movie', value: 'ww2' },
        ],
      },
    ]);
    return fileType;
  }
  async promptSection(fileType: FileType): Promise<SectionType> {
    if (fileType === 'series') {
      const { section } = await inquirer.prompt([
        {
          type: 'list',
          name: 'section',
          message: 'Select section:',
          choices: [
            { name: 'To see', value: 'to-see' },
            { name: 'Seen', value: 'seen' },
            { name: 'Others to see', value: 'others' },
            { name: 'Cancel', value: 'cancel' },
          ],
        },
      ]);
      return section;
    }
    if (fileType === 'ww2') {
      const { section } = await inquirer.prompt([
        {
          type: 'list',
          name: 'section',
          message: 'Select section:',
          choices: [
            { name: 'To see', value: 'to-see' },
            { name: 'Seen', value: 'seen' },
            { name: 'Cancel', value: 'cancel' },
          ],
        },
      ]);
      return section;
    }
    const { section } = await inquirer.prompt([
      {
        type: 'list',
        name: 'section',
        message: 'Select section:',
        choices: [
          { name: 'To see', value: 'to-see' },
          { name: 'Seen', value: 'seen' },
          { name: 'Israel', value: 'israel' },
        ],
      },
    ]);
    return section;
  }
  async promptName(): Promise<string> {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Name:',
        validate: (input: string) => {
          if (!validateNonEmpty(input)) {
            return 'Name cannot be empty. Please enter a name.';
          }
          if (input.trim().length > 1000) {
            return 'Name is too long. Maximum 1000 characters allowed.';
          }
          return true;
        },
      },
    ]);
    return name.trim();
  }
  async promptYear(): Promise<number> {
    const { year } = await inquirer.prompt([
      {
        type: 'input',
        name: 'year',
        message: 'Year:',
        validate: (input: string) => {
          const yearNum = parseInt(input, 10);
          if (isNaN(yearNum)) {
            return 'Year must be a number';
          }
          if (yearNum < 1900 || yearNum > 2100) {
            return 'Year must be between 1900 and 2100';
          }
          return true;
        },
      },
    ]);
    return parseInt(year, 10);
  }
  async promptSeasons(): Promise<number[]> {
    const { seasonsInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'seasonsInput',
        message: 'Seasons (Format: 1,2,3,4):',
        default: '',
        validate: (input: string) => {
          if (!input || !input.trim()) {
            return true;
          }
          const cleaned = input.trim();
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
      },
    ]);
    return parseSeasonInput(seasonsInput);
  }
  async promptHebrew(): Promise<string> {
    const { hebrew } = await inquirer.prompt([
      {
        type: 'input',
        name: 'hebrew',
        message: 'Hebrew name (optional):',
        default: '',
        validate: (input: string) => {
          if (!input || !input.trim()) {
            return true;
          }
          if (!isValidHebrew(input)) {
            return 'Hebrew name must contain only Hebrew characters, numbers, and punctuation';
          }
          return true;
        },
      },
    ]);
    return hebrew.trim();
  }
  async promptAddMore(fileType: FileType): Promise<boolean> {
    const fileTypeLabel = fileType === 'series' ? 'Series' : fileType === 'movie' ? 'Movies' : 'WW2 movies';
    const { addMore } = await inquirer.prompt([
      {
        type: 'list',
        name: 'addMore',
        message: `Would you like to add more ${fileTypeLabel}?`,
        choices: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
    ]);
    return addMore;
  }
  async promptConfirmWrite(): Promise<boolean> {
    const { confirm } = await inquirer.prompt([
      {
        type: 'list',
        name: 'confirm',
        message: 'Write these changes to file?',
        choices: [
          { name: 'Yes', value: true },
          { name: 'No (discard all changes)', value: false },
        ],
      },
    ]);
    return confirm;
  }
}
