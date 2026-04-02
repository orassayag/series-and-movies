import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileWriter } from '../fileWriter.js';
import { ParsedFile, SectionType, ParsedSection } from '../../types/index.js';
import * as fs from 'fs/promises';

vi.mock('fs/promises');

describe('FileWriter', () => {
  let writer: FileWriter;
  beforeEach(() => {
    writer = new FileWriter();
    vi.clearAllMocks();
  });

  it('should write series file with multiple sections', async () => {
    const parsedFile: ParsedFile = {
      sections: new Map<SectionType, ParsedSection>([
        [
          'to-see',
          {
            header: 'TO SEE:',
            entries: [
              { name: 'Black Mirror', year: undefined, seasons: [7], hebrew: 'מראה שחורה' },
              { name: 'The Boys', year: undefined, seasons: [1, 2, 3], hebrew: 'הבנים' },
            ],
          },
        ],
        [
          'others',
          {
            header: 'OTHERS TO SEE:',
            entries: [{ name: 'Some Series', year: undefined, seasons: [1], hebrew: 'Hebrew' }],
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
    await writer.writeFile('/test/file.txt', parsedFile);
    const expectedContent = `TO SEE:
=======
Black Mirror: 7 (הרוחש הארמ)
The Boys: 1, 2, 3 (םינבה)

OTHERS TO SEE:
==============
Some Series: 1 (werbeH)

SEEN:
=====
Dark: 1, 2, 3 (לפא)
`;
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
      '/test/file.txt',
      expectedContent,
      'utf-8'
    );
  });

  it('should write movie file with correct sections', async () => {
    const parsedFile: ParsedFile = {
      sections: new Map<SectionType, ParsedSection>([
        [
          'to-see',
          {
            header: 'TO SEE:',
            entries: [{ name: 'Interstellar 2014', year: 2014, seasons: [], hebrew: 'בין כוכבים' }],
          },
        ],
        [
          'israel',
          {
            header: 'ISRAEL:',
            entries: [{ name: 'Golda (film) 2023', year: 2023, seasons: [], hebrew: 'גולדה' }],
          },
        ],
        [
          'seen',
          {
            header: 'SEEN:',
            entries: [{ name: 'The Matrix 1999', year: 1999, seasons: [], hebrew: 'מטריקס' }],
          },
        ],
      ]),
    };
    await writer.writeFile('/test/movies.txt', parsedFile);
    const expectedContent = `TO SEE:
=======
Interstellar 2014 (םיבכוכ ןיב)

ISRAEL:
=======
Golda (film) 2023 (הדלוג)

SEEN:
=====
The Matrix 1999 (סקירטמ)
`;
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
      '/test/movies.txt',
      expectedContent,
      'utf-8'
    );
  });

  it('should handle empty sections', async () => {
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
            entries: [{ name: 'Dark', year: undefined, seasons: [1, 2, 3], hebrew: 'אפל' }],
          },
        ],
      ]),
    };
    await writer.writeFile('/test/file.txt', parsedFile);
    const expectedContent = `TO SEE:
=======

SEEN:
=====
Dark: 1, 2, 3 (לפא)
`;
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
      '/test/file.txt',
      expectedContent,
      'utf-8'
    );
  });

  it('should handle entries without Hebrew', async () => {
    const parsedFile: ParsedFile = {
      sections: new Map<SectionType, ParsedSection>([
        [
          'to-see',
          {
            header: 'TO SEE:',
            entries: [
              { name: 'Black Mirror', year: undefined, seasons: [7], hebrew: '' },
              { name: 'The Boys', year: undefined, seasons: [1, 2, 3], hebrew: '' },
            ],
          },
        ],
      ]),
    };
    await writer.writeFile('/test/file.txt', parsedFile);
    const expectedContent = `TO SEE:
=======
Black Mirror: 7
The Boys: 1, 2, 3
`;
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
      '/test/file.txt',
      expectedContent,
      'utf-8'
    );
  });

  it('should respect section order', async () => {
    const parsedFile: ParsedFile = {
      sections: new Map<SectionType, ParsedSection>([
        [
          'seen',
          {
            header: 'SEEN:',
            entries: [{ name: 'Dark', year: undefined, seasons: [1], hebrew: '' }],
          },
        ],
        [
          'to-see',
          {
            header: 'TO SEE:',
            entries: [{ name: 'Black Mirror', year: undefined, seasons: [1], hebrew: '' }],
          },
        ],
      ]),
    };
    await writer.writeFile('/test/file.txt', parsedFile);
    const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
    const toSeeIndex = writtenContent.indexOf('TO SEE:');
    const seenIndex = writtenContent.indexOf('SEEN:');
    expect(toSeeIndex).toBeLessThan(seenIndex);
  });
});
