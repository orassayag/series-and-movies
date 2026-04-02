import { describe, it, expect } from 'vitest';
import {
  extractName,
  extractYear,
  extractSeasons,
  extractHebrew,
  formatEntry,
  parseSeasonInput,
} from '../parseUtils.js';

describe('extractName', () => {
  it('should extract name from series with seasons', () => {
    expect(extractName('Black Mirror: 7 (מראה שחורה)')).toBe('Black Mirror');
    expect(extractName('The Boys: 1, 2, 3, 4, 5, 6 (הבנים)')).toBe('The Boys');
  });

  it('should extract name from series without seasons', () => {
    expect(extractName('Dune: Prophecy: (חולית: הנבואה)')).toBe('Dune: Prophecy');
  });

  it('should extract name from movie', () => {
    expect(extractName('Interstellar 2014 (בין כוכבים)')).toBe('Interstellar 2014');
    expect(extractName('The Matrix 1999 (מטריקס)')).toBe('The Matrix 1999');
  });

  it('should handle entries without Hebrew', () => {
    expect(extractName('Some Series: 1, 2, 3')).toBe('Some Series');
    expect(extractName('Some Movie')).toBe('Some Movie');
  });

  it('should handle empty lines', () => {
    expect(extractName('')).toBe('');
    expect(extractName('   ')).toBe('');
  });

  it('should handle entries with only name', () => {
    expect(extractName('Simple Name')).toBe('Simple Name');
  });
});

describe('extractYear', () => {
  it('should extract year from movie entries', () => {
    expect(extractYear('Interstellar 2014 (בין כוכבים)')).toBe(2014);
    expect(extractYear('The Matrix 1999 (מטריקס)')).toBe(1999);
    expect(extractYear('Inception 2010')).toBe(2010);
  });

  it('should return undefined for entries without year', () => {
    expect(extractYear('Movie Name')).toBeUndefined();
    expect(extractYear('Series: 1, 2, 3')).toBeUndefined();
  });

  it('should extract 4-digit year (1900-2099)', () => {
    expect(extractYear('Old Movie 1920')).toBe(1920);
    expect(extractYear('Future Movie 2099')).toBe(2099);
  });
});

describe('extractSeasons', () => {
  it('should extract seasons from series', () => {
    expect(extractSeasons('Black Mirror: 7 (מראה שחורה)')).toEqual([7]);
    expect(extractSeasons('The Boys: 1, 2, 3, 4, 5, 6 (הבנים)')).toEqual([1, 2, 3, 4, 5, 6]);
    expect(extractSeasons('Rick and Morty: 2, 3, 4, 5, 6, 7 (ריק ומורטי)')).toEqual([
      2, 3, 4, 5, 6, 7,
    ]);
  });

  it('should return empty array for entries without colon', () => {
    expect(extractSeasons('Movie Name (Hebrew)')).toEqual([]);
    expect(extractSeasons('Simple Name')).toEqual([]);
  });

  it('should return empty array for entries with empty seasons', () => {
    expect(extractSeasons('Dune: Prophecy: (חולית: הנבואה)')).toEqual([]);
  });

  it('should handle seasons with spaces', () => {
    expect(extractSeasons('Series: 1,  2,  3 (Hebrew)')).toEqual([1, 2, 3]);
  });

  it('should deduplicate and sort seasons', () => {
    expect(extractSeasons('Series: 3, 1, 2, 1 (Hebrew)')).toEqual([1, 2, 3]);
  });

  it('should ignore non-numeric values', () => {
    expect(extractSeasons('Series: 1, abc, 2 (Hebrew)')).toEqual([1, 2]);
  });
});

describe('extractHebrew', () => {
  it('should extract Hebrew text from parentheses', () => {
    expect(extractHebrew('Black Mirror: 7 (מראה שחורה)')).toBe('מראה שחורה');
    expect(extractHebrew('The Boys: 1, 2, 3 (הבנים)')).toBe('הבנים');
    expect(extractHebrew('Interstellar 2014 (בין כוכבים)')).toBe('בין כוכבים');
  });

  it('should handle entries without parentheses', () => {
    expect(extractHebrew('Series Name: 1, 2, 3')).toBe('');
    expect(extractHebrew('Movie Name')).toBe('');
  });

  it('should handle empty parentheses', () => {
    expect(extractHebrew('Series: 1, 2 ()')).toBe('');
  });

  it('should handle multiple colons in Hebrew', () => {
    expect(extractHebrew('Dune: Prophecy: (חולית: הנבואה)')).toBe('חולית: הנבואה');
  });
});

describe('formatEntry', () => {
  it('should format series with seasons and Hebrew', () => {
    expect(formatEntry('Black Mirror', undefined, [7], 'מראה שחורה')).toBe('Black Mirror: 7 (מראה שחורה)');
    expect(formatEntry('The Boys', 2024, [1, 2, 3], 'הבנים')).toBe('The Boys 2024: 1, 2, 3 (הבנים)');
  });

  it('should format movie without seasons', () => {
    expect(formatEntry('Interstellar', 2014, [], 'בין כוכבים')).toBe('Interstellar 2014 (בין כוכבים)');
  });

  it('should format entry without Hebrew', () => {
    expect(formatEntry('Series Name', 2023, [1, 2], '')).toBe('Series Name 2023: 1, 2');
    expect(formatEntry('Movie Name', 2020, [], '')).toBe('Movie Name 2020');
  });

  it('should format series without Hebrew', () => {
    expect(formatEntry('Some Series', undefined, [1, 2, 3], '')).toBe('Some Series: 1, 2, 3');
  });

  it('should format entry without year', () => {
    expect(formatEntry('Old Movie', undefined, [], 'סרט ישן')).toBe('Old Movie (סרט ישן)');
  });
});

describe('parseSeasonInput', () => {
  it('should parse comma-separated seasons', () => {
    expect(parseSeasonInput('1,2,3')).toEqual([1, 2, 3]);
    expect(parseSeasonInput('1, 2, 3')).toEqual([1, 2, 3]);
    expect(parseSeasonInput('1,  2,  3')).toEqual([1, 2, 3]);
  });

  it('should return empty array for empty input', () => {
    expect(parseSeasonInput('')).toEqual([]);
    expect(parseSeasonInput('   ')).toEqual([]);
  });

  it('should deduplicate and sort seasons', () => {
    expect(parseSeasonInput('3, 1, 2, 1')).toEqual([1, 2, 3]);
  });

  it('should throw error for invalid characters', () => {
    expect(() => parseSeasonInput('1, abc, 2')).toThrow(
      'Seasons must contain only numbers and commas'
    );
  });

  it('should throw error for negative numbers', () => {
    expect(() => parseSeasonInput('1, -2, 3')).toThrow('Seasons cannot be negative numbers');
  });

  it('should throw error for zero', () => {
    expect(() => parseSeasonInput('0, 1, 2')).toThrow(
      'Seasons must be positive numbers (greater than 0)'
    );
  });

  it('should throw error for season numbers above 1000', () => {
    expect(() => parseSeasonInput('1, 1001, 2')).toThrow('Season numbers must be between 1 and 1000');
  });

  it('should accept season 1000', () => {
    expect(parseSeasonInput('1000')).toEqual([1000]);
  });

  it('should handle single season', () => {
    expect(parseSeasonInput('5')).toEqual([5]);
  });
});
