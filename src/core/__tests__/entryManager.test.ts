import { describe, it, expect, beforeEach } from 'vitest';
import { EntryManager } from '../entryManager.js';
import { ParsedFile, SectionType, ParsedSection, UserInput } from '../../types/index.js';

describe('EntryManager', () => {
  let manager: EntryManager;
  let parsedFile: ParsedFile;
  beforeEach(() => {
    manager = new EntryManager();
    parsedFile = {
      sections: new Map<SectionType, ParsedSection>([
        [
          'to-see',
          {
            header: 'TO SEE:',
            entries: [
              { name: 'Black Mirror', year: undefined, seasons: [1, 2], hebrew: 'מראה שחורה' },
              { name: 'The Boys', year: undefined, seasons: [1, 2, 3], hebrew: 'הבנים' },
            ],
          },
        ],
        [
          'seen',
          {
            header: 'SEEN:',
            entries: [{ name: 'Dark', year: undefined, seasons: [1, 2, 3], hebrew: 'אפל' }],
          },
        ],
      ]),
    };
  });

  describe('addOrUpdateEntry', () => {
    it('should add new entry to section', () => {
      const input: UserInput = {
        fileType: 'series',
        section: 'to-see',
        name: 'New Series',
        year: 2024,
        seasons: [1, 2],
        hebrew: 'סדרה חדשה',
      };
      manager.addOrUpdateEntry(parsedFile, input);
      const section = parsedFile.sections.get('to-see')!;
      expect(section.entries.length).toBe(3);
      expect(section.entries[0]).toEqual({
        name: 'New Series',
        year: 2024,
        seasons: [1, 2],
        hebrew: 'סדרה חדשה',
      });
    });

    it('should merge seasons for existing entry', () => {
      const input: UserInput = {
        fileType: 'series',
        section: 'to-see',
        name: 'Black Mirror',
        year: 2023,
        seasons: [3, 4],
        hebrew: 'מראה שחורה',
      };
      manager.addOrUpdateEntry(parsedFile, input);
      const section = parsedFile.sections.get('to-see')!;
      const entry = section.entries.find((e) => e.name === 'Black Mirror');
      expect(entry?.seasons).toEqual([1, 2, 3, 4]);
    });

    it('should throw error for duplicate seasons in same section', () => {
      const input: UserInput = {
        fileType: 'series',
        section: 'to-see',
        name: 'Black Mirror',
        year: 2023,
        seasons: [1, 2],
        hebrew: 'מראה שחורה',
      };
      expect(() => manager.addOrUpdateEntry(parsedFile, input)).toThrow('already exists in to-see');
    });

    it('should allow same name in different section with different seasons', () => {
      const input: UserInput = {
        fileType: 'series',
        section: 'seen',
        name: 'Black Mirror',
        year: 2023,
        seasons: [3, 4],
        hebrew: 'מראה שחורה',
      };
      expect(() => manager.addOrUpdateEntry(parsedFile, input)).not.toThrow();
      const section = parsedFile.sections.get('seen')!;
      expect(section.entries.length).toBe(2);
    });

    it('should move entry from one section to another with same seasons', () => {
      const input: UserInput = {
        fileType: 'series',
        section: 'seen',
        name: 'Black Mirror',
        year: 2023,
        seasons: [1, 2],
        hebrew: 'מראה שחורה',
      };
      manager.addOrUpdateEntry(parsedFile, input);
      const toSeeSection = parsedFile.sections.get('to-see')!;
      const seenSection = parsedFile.sections.get('seen')!;
      expect(toSeeSection.entries.find((e) => e.name === 'Black Mirror')).toBeUndefined();
      expect(seenSection.entries.find((e) => e.name === 'Black Mirror')).toBeDefined();
    });

    it('should match names case-insensitively', () => {
      const input: UserInput = {
        fileType: 'series',
        section: 'to-see',
        name: 'black mirror',
        year: 2023,
        seasons: [5],
        hebrew: '',
      };
      manager.addOrUpdateEntry(parsedFile, input);
      const section = parsedFile.sections.get('to-see')!;
      const entry = section.entries.find((e) => e.name === 'black mirror');
      expect(entry?.seasons).toEqual([1, 2, 5]);
    });

    it('should preserve existing Hebrew when updating with empty Hebrew', () => {
      const input: UserInput = {
        fileType: 'series',
        section: 'to-see',
        name: 'Black Mirror',
        year: 2023,
        seasons: [3],
        hebrew: '',
      };
      manager.addOrUpdateEntry(parsedFile, input);
      const section = parsedFile.sections.get('to-see')!;
      const entry = section.entries.find((e) => e.name === 'Black Mirror');
      expect(entry?.hebrew).toBe('מראה שחורה');
    });

    it('should handle movies without seasons', () => {
      parsedFile.sections.set('to-see', {
        header: 'TO SEE:',
        entries: [{ name: 'Interstellar', year: 2014, seasons: [], hebrew: 'בין כוכבים' }],
      });
      const input: UserInput = {
        fileType: 'movie',
        section: 'to-see',
        name: 'The Matrix',
        year: 1999,
        seasons: [],
        hebrew: 'מטריקס',
      };
      manager.addOrUpdateEntry(parsedFile, input);
      const section = parsedFile.sections.get('to-see')!;
      expect(section.entries.length).toBe(2);
      expect(section.entries[0].name).toBe('The Matrix');
    });

    it('should move duplicate movie from one section to another', () => {
      parsedFile.sections.set('to-see', {
        header: 'TO SEE:',
        entries: [{ name: 'Interstellar', year: 2014, seasons: [], hebrew: 'בין כוכבים' }],
      });
      parsedFile.sections.set('seen', {
        header: 'SEEN:',
        entries: [],
      });
      const input: UserInput = {
        fileType: 'movie',
        section: 'seen',
        name: 'Interstellar',
        year: 2014,
        seasons: [],
        hebrew: 'בין כוכבים',
      };
      manager.addOrUpdateEntry(parsedFile, input);
      const toSeeSection = parsedFile.sections.get('to-see')!;
      const seenSection = parsedFile.sections.get('seen')!;
      expect(toSeeSection.entries.find((e) => e.name === 'Interstellar')).toBeUndefined();
      expect(seenSection.entries.find((e) => e.name === 'Interstellar')).toBeDefined();
    });
  });
});
