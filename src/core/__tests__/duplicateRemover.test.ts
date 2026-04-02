import { describe, it, expect, beforeEach } from 'vitest';
import { DuplicateRemover } from '../duplicateRemover.js';
import { ParsedFile, SectionType, ParsedSection } from '../../types/index.js';

describe('DuplicateRemover', () => {
  let remover: DuplicateRemover;
  beforeEach(() => {
    remover = new DuplicateRemover();
  });

  describe('removeDuplicatesInSection', () => {
    it('should remove duplicate entries in same section (keep first)', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'to-see',
            {
              header: 'TO SEE:',
              entries: [
                { name: 'Black Mirror', seasons: [1, 2], hebrew: 'מראה שחורה' },
                { name: 'The Boys', seasons: [1], hebrew: 'הבנים' },
                { name: 'Black Mirror', seasons: [3, 4], hebrew: 'מראה שחורה' },
              ],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      const toSee = result.cleanedFile.sections.get('to-see')!;
      expect(toSee.entries.length).toBe(2);
      expect(toSee.entries[0].name).toBe('Black Mirror');
      expect(toSee.entries[0].seasons).toEqual([1, 2]);
      expect(toSee.entries[1].name).toBe('The Boys');
      expect(result.removedEntries.length).toBe(1);
      expect(result.removedEntries[0].name).toBe('Black Mirror');
      expect(result.removedEntries[0].reason).toBe('duplicate-in-section');
    });

    it('should handle case-insensitive matching', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'to-see',
            {
              header: 'TO SEE:',
              entries: [
                { name: 'Black Mirror', seasons: [1], hebrew: '' },
                { name: 'black mirror', seasons: [2], hebrew: '' },
                { name: 'BLACK MIRROR', seasons: [3], hebrew: '' },
              ],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      const toSee = result.cleanedFile.sections.get('to-see')!;
      expect(toSee.entries.length).toBe(1);
      expect(toSee.entries[0].name).toBe('Black Mirror');
      expect(result.removedEntries.length).toBe(2);
    });

    it('should remove multiple duplicates (keep only first)', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'to-see',
            {
              header: 'TO SEE:',
              entries: [
                { name: 'Series X', seasons: [1], hebrew: '' },
                { name: 'Series X', seasons: [2], hebrew: '' },
                { name: 'Series X', seasons: [3], hebrew: '' },
                { name: 'Series X', seasons: [4], hebrew: '' },
              ],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      const toSee = result.cleanedFile.sections.get('to-see')!;
      expect(toSee.entries.length).toBe(1);
      expect(result.removedEntries.length).toBe(3);
    });
  });

  describe('removeCrossSectionDuplicates - Series', () => {
    it('should keep both when series has different seasons in different sections', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'to-see',
            {
              header: 'TO SEE:',
              entries: [{ name: 'Black Mirror', seasons: [3, 4], hebrew: 'מראה שחורה' }],
            },
          ],
          [
            'seen',
            {
              header: 'SEEN:',
              entries: [{ name: 'Black Mirror', seasons: [1, 2], hebrew: 'מראה שחורה' }],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      const toSee = result.cleanedFile.sections.get('to-see')!;
      const seen = result.cleanedFile.sections.get('seen')!;
      expect(toSee.entries.length).toBe(1);
      expect(seen.entries.length).toBe(1);
      expect(result.removedEntries.length).toBe(0);
    });

    it('should remove from SEEN when series has same seasons in TO SEE', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'to-see',
            {
              header: 'TO SEE:',
              entries: [{ name: 'Black Mirror', seasons: [1, 2], hebrew: 'מראה שחורה' }],
            },
          ],
          [
            'seen',
            {
              header: 'SEEN:',
              entries: [{ name: 'Black Mirror', seasons: [1, 2], hebrew: 'מראה שחורה' }],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      const toSee = result.cleanedFile.sections.get('to-see')!;
      const seen = result.cleanedFile.sections.get('seen')!;
      expect(toSee.entries.length).toBe(1);
      expect(seen.entries.length).toBe(0);
      expect(result.removedEntries.length).toBe(1);
      expect(result.removedEntries[0].section).toBe('seen');
      expect(result.removedEntries[0].reason).toBe('cross-section-priority');
    });
  });

  describe('removeCrossSectionDuplicates - Movies', () => {
    it('should remove movie from SEEN if exists in TO SEE', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'to-see',
            {
              header: 'TO SEE:',
              entries: [{ name: 'Interstellar', seasons: [], hebrew: 'בין כוכבים' }],
            },
          ],
          [
            'seen',
            {
              header: 'SEEN:',
              entries: [{ name: 'Interstellar', seasons: [], hebrew: 'בין כוכבים' }],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      const toSee = result.cleanedFile.sections.get('to-see')!;
      const seen = result.cleanedFile.sections.get('seen')!;
      expect(toSee.entries.length).toBe(1);
      expect(seen.entries.length).toBe(0);
      expect(result.removedEntries.length).toBe(1);
      expect(result.removedEntries[0].section).toBe('seen');
    });

    it('should remove movie from SEEN if exists in ISRAEL', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'israel',
            {
              header: 'ISRAEL:',
              entries: [{ name: 'Golda', seasons: [], hebrew: 'גולדה' }],
            },
          ],
          [
            'seen',
            {
              header: 'SEEN:',
              entries: [{ name: 'Golda', seasons: [], hebrew: 'גולדה' }],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      const israel = result.cleanedFile.sections.get('israel')!;
      const seen = result.cleanedFile.sections.get('seen')!;
      expect(israel.entries.length).toBe(1);
      expect(seen.entries.length).toBe(0);
      expect(result.removedEntries.length).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty sections', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'to-see',
            {
              header: 'TO SEE:',
              entries: [],
            },
          ],
          [
            'seen',
            {
              header: 'SEEN:',
              entries: [],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      expect(result.removedEntries.length).toBe(0);
    });

    it('should return empty removal list when no duplicates', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'to-see',
            {
              header: 'TO SEE:',
              entries: [
                { name: 'Series A', seasons: [1], hebrew: '' },
                { name: 'Series B', seasons: [1], hebrew: '' },
              ],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      expect(result.removedEntries.length).toBe(0);
    });

    it('should handle partial season overlap (remove overlapping from SEEN)', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'to-see',
            {
              header: 'TO SEE:',
              entries: [{ name: 'Black Mirror', seasons: [1, 2, 3], hebrew: '' }],
            },
          ],
          [
            'seen',
            {
              header: 'SEEN:',
              entries: [{ name: 'Black Mirror', seasons: [3, 4, 5], hebrew: '' }],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      const toSee = result.cleanedFile.sections.get('to-see')!;
      const seen = result.cleanedFile.sections.get('seen')!;
      expect(toSee.entries.length).toBe(1);
      expect(toSee.entries[0].seasons).toEqual([1, 2, 3]);
      expect(seen.entries.length).toBe(1);
      expect(seen.entries[0].seasons).toEqual([4, 5]);
      expect(result.removedEntries.length).toBe(0);
    });

    it('should remove entry from SEEN if all seasons overlap with TO SEE', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'to-see',
            {
              header: 'TO SEE:',
              entries: [{ name: 'Series X', seasons: [1, 2, 3], hebrew: '' }],
            },
          ],
          [
            'seen',
            {
              header: 'SEEN:',
              entries: [{ name: 'Series X', seasons: [2, 3], hebrew: '' }],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      const toSee = result.cleanedFile.sections.get('to-see')!;
      const seen = result.cleanedFile.sections.get('seen')!;
      expect(toSee.entries.length).toBe(1);
      expect(toSee.entries[0].seasons).toEqual([1, 2, 3]);
      expect(seen.entries.length).toBe(0);
      expect(result.removedEntries.length).toBe(1);
      expect(result.removedEntries[0].name).toBe('Series X');
      expect(result.removedEntries[0].section).toBe('seen');
    });

    it('should keep both when no season overlap', () => {
      const parsedFile: ParsedFile = {
        sections: new Map<SectionType, ParsedSection>([
          [
            'to-see',
            {
              header: 'TO SEE:',
              entries: [{ name: 'Series X', seasons: [1, 2], hebrew: '' }],
            },
          ],
          [
            'seen',
            {
              header: 'SEEN:',
              entries: [{ name: 'Series X', seasons: [5, 6], hebrew: '' }],
            },
          ],
        ]),
      };
      const result = remover.removeDuplicates(parsedFile);
      expect(result.cleanedFile.sections.get('to-see')!.entries.length).toBe(1);
      expect(result.cleanedFile.sections.get('seen')!.entries.length).toBe(1);
      expect(result.cleanedFile.sections.get('to-see')!.entries[0].seasons).toEqual([1, 2]);
      expect(result.cleanedFile.sections.get('seen')!.entries[0].seasons).toEqual([5, 6]);
      expect(result.removedEntries.length).toBe(0);
    });
  });
});
