import { describe, it, expect } from 'vitest';
import {
  normalizeNameForComparison,
  namesMatch,
  validateNonEmpty,
  mergeSeasons,
  seasonsEqual,
  isValidHebrew,
} from '../validationUtils.js';

describe('normalizeNameForComparison', () => {
  it('should convert to lowercase', () => {
    expect(normalizeNameForComparison('Black Mirror')).toBe('black mirror');
    expect(normalizeNameForComparison('THE MATRIX')).toBe('the matrix');
  });

  it('should trim whitespace', () => {
    expect(normalizeNameForComparison('  Black Mirror  ')).toBe('black mirror');
  });

  it('should handle mixed case', () => {
    expect(normalizeNameForComparison('ThE bOyS')).toBe('the boys');
  });
});

describe('namesMatch', () => {
  it('should match identical names', () => {
    expect(namesMatch('Black Mirror', 'Black Mirror')).toBe(true);
  });

  it('should match case-insensitive names', () => {
    expect(namesMatch('Black Mirror', 'black mirror')).toBe(true);
    expect(namesMatch('BLACK MIRROR', 'black mirror')).toBe(true);
  });

  it('should match names with different whitespace', () => {
    expect(namesMatch('  Black Mirror  ', 'Black Mirror')).toBe(true);
  });

  it('should not match different names', () => {
    expect(namesMatch('Black Mirror', 'The Boys')).toBe(false);
  });
});

describe('validateNonEmpty', () => {
  it('should return true for non-empty strings', () => {
    expect(validateNonEmpty('Black Mirror')).toBe(true);
    expect(validateNonEmpty('a')).toBe(true);
  });

  it('should return false for empty strings', () => {
    expect(validateNonEmpty('')).toBe(false);
    expect(validateNonEmpty('   ')).toBe(false);
    expect(validateNonEmpty('\t\n')).toBe(false);
  });
});

describe('mergeSeasons', () => {
  it('should merge and deduplicate seasons', () => {
    expect(mergeSeasons([1, 2], [3, 4])).toEqual([1, 2, 3, 4]);
    expect(mergeSeasons([1, 2, 3], [2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('should sort merged seasons', () => {
    expect(mergeSeasons([3, 1], [2, 4])).toEqual([1, 2, 3, 4]);
  });

  it('should handle empty arrays', () => {
    expect(mergeSeasons([], [1, 2, 3])).toEqual([1, 2, 3]);
    expect(mergeSeasons([1, 2, 3], [])).toEqual([1, 2, 3]);
    expect(mergeSeasons([], [])).toEqual([]);
  });

  it('should handle duplicate seasons', () => {
    expect(mergeSeasons([1, 2], [1, 2])).toEqual([1, 2]);
  });
});

describe('seasonsEqual', () => {
  it('should return true for equal seasons', () => {
    expect(seasonsEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(seasonsEqual([], [])).toBe(true);
  });

  it('should return true for equal seasons in different order', () => {
    expect(seasonsEqual([3, 1, 2], [1, 2, 3])).toBe(true);
  });

  it('should return false for different seasons', () => {
    expect(seasonsEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(seasonsEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it('should return false for different lengths', () => {
    expect(seasonsEqual([1, 2], [1])).toBe(false);
  });
});

describe('isValidHebrew', () => {
  it('should accept valid Hebrew text', () => {
    expect(isValidHebrew('מראה שחורה')).toBe(true);
    expect(isValidHebrew('הבנים')).toBe(true);
    expect(isValidHebrew('בין כוכבים')).toBe(true);
  });

  it('should accept Hebrew with numbers', () => {
    expect(isValidHebrew('סרט 2024')).toBe(true);
    expect(isValidHebrew('חלק 1')).toBe(true);
  });

  it('should accept Hebrew with punctuation', () => {
    expect(isValidHebrew('חולית: הנבואה')).toBe(true);
    expect(isValidHebrew('שם (תרגום)')).toBe(true);
    expect(isValidHebrew('א-ב')).toBe(true);
  });

  it('should accept empty or whitespace', () => {
    expect(isValidHebrew('')).toBe(true);
    expect(isValidHebrew('   ')).toBe(true);
  });

  it('should reject English letters', () => {
    expect(isValidHebrew('Hebrew text with English')).toBe(false);
    expect(isValidHebrew('abc')).toBe(false);
  });

  it('should accept common punctuation', () => {
    expect(isValidHebrew('טקסט, עוד טקסט')).toBe(true);
    expect(isValidHebrew('"טקסט"')).toBe(true);
    expect(isValidHebrew("'טקסט'")).toBe(true);
  });
});
