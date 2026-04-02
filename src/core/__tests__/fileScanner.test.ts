import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileScanner } from '../fileScanner.js';
import * as fs from 'fs/promises';

vi.mock('fs/promises');

describe('FileScanner', () => {
  let scanner: FileScanner;
  beforeEach(() => {
    scanner = new FileScanner();
    vi.clearAllMocks();
  });

  it('should parse series file with multiple sections', async () => {
    const mockContent = `TO SEE:
=======
Black Mirror: 7 (מראה שחורה)
The Boys: 1, 2, 3 (הבנים)

OTHERS TO SEE:
==============
Some Series: 1 (Hebrew)

SEEN:
=====
Dark: 1, 2, 3 (אפל)
`;
    vi.mocked(fs.readFile).mockResolvedValue(mockContent);
    const result = await scanner.scanFile('/test/file.txt');
    expect(result.sections.size).toBe(3);
    const toSee = result.sections.get('to-see');
    expect(toSee?.entries.length).toBe(2);
    expect(toSee?.entries[0]).toEqual({
      name: 'Black Mirror',
      year: undefined,
      seasons: [7],
      hebrew: 'מראה שחורה',
    });
    expect(toSee?.entries[1]).toEqual({
      name: 'The Boys',
      year: undefined,
      seasons: [1, 2, 3],
      hebrew: 'הבנים',
    });
    const others = result.sections.get('others');
    expect(others?.entries.length).toBe(1);
    expect(others?.entries[0]).toEqual({
      name: 'Some Series',
      year: undefined,
      seasons: [1],
      hebrew: 'Hebrew',
    });
    const seen = result.sections.get('seen');
    expect(seen?.entries.length).toBe(1);
    expect(seen?.entries[0]).toEqual({
      name: 'Dark',
      year: undefined,
      seasons: [1, 2, 3],
      hebrew: 'אפל',
    });
  });

  it('should parse movie file with different sections', async () => {
    const mockContent = `TO SEE:
=======
Interstellar 2014 (בין כוכבים)

ISRAEL:
=======
Golda (film) 2023 (גולדה)

SEEN:
=====
The Matrix 1999 (מטריקס)
`;
    vi.mocked(fs.readFile).mockResolvedValue(mockContent);
    const result = await scanner.scanFile('/test/movies.txt');
    expect(result.sections.size).toBe(3);
    const toSee = result.sections.get('to-see');
    expect(toSee?.entries[0]).toEqual({
      name: 'Interstellar 2014',
      year: 2014,
      seasons: [],
      hebrew: 'בין כוכבים',
    });
    const israel = result.sections.get('israel');
    expect(israel?.entries[0]).toEqual({
      name: 'Golda (film) 2023',
      year: 2023,
      seasons: [],
      hebrew: 'גולדה',
    });
  });

  it('should handle empty sections', async () => {
    const mockContent = `TO SEE:
=======

SEEN:
=====
Dark: 1, 2, 3 (אפל)
`;
    vi.mocked(fs.readFile).mockResolvedValue(mockContent);
    const result = await scanner.scanFile('/test/file.txt');
    expect(result.sections.size).toBe(2);
    const toSee = result.sections.get('to-see');
    expect(toSee?.entries.length).toBe(0);
    const seen = result.sections.get('seen');
    expect(seen?.entries.length).toBe(1);
  });

  it('should ignore separator lines and comments', async () => {
    const mockContent = `TO SEE:
=======
-Note: Check these later
===============
Black Mirror: 7 (מראה שחורה)
-Comment about this series
The Boys: 1, 2, 3 (הבנים)

SEEN:
=====
Dark: 1, 2, 3 (אפל)
`;
    vi.mocked(fs.readFile).mockResolvedValue(mockContent);
    const result = await scanner.scanFile('/test/file.txt');
    const toSee = result.sections.get('to-see');
    expect(toSee?.entries.length).toBe(2);
    expect(toSee?.entries[0].name).toBe('Black Mirror');
    expect(toSee?.entries[1].name).toBe('The Boys');
  });

  it('should handle entries without Hebrew', async () => {
    const mockContent = `TO SEE:
=======
Black Mirror: 7
The Boys: 1, 2, 3

SEEN:
=====
`;
    vi.mocked(fs.readFile).mockResolvedValue(mockContent);
    const result = await scanner.scanFile('/test/file.txt');
    const toSee = result.sections.get('to-see');
    expect(toSee?.entries[0].hebrew).toBe('');
    expect(toSee?.entries[1].hebrew).toBe('');
  });
});
