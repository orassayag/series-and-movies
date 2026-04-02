export function normalizeNameForComparison(name: string): string {
  return name.trim().toLowerCase();
}

export function namesMatch(name1: string, name2: string): boolean {
  return normalizeNameForComparison(name1) === normalizeNameForComparison(name2);
}

export function validateNonEmpty(input: string): boolean {
  return input.trim().length > 0;
}

export function isValidHebrew(text: string): boolean {
  if (!text || !text.trim()) {
    return true;
  }
  const hebrewRegex = /^[\u0590-\u05FF0-9\s()\-/:,.'"]+$/;
  return hebrewRegex.test(text);
}

export function mergeSeasons(existing: number[], newSeasons: number[]): number[] {
  const combined = [...existing, ...newSeasons];
  return [...new Set(combined)].sort((a, b) => a - b);
}

export function seasonsEqual(seasons1: number[], seasons2: number[]): boolean {
  if (seasons1.length !== seasons2.length) {
    return false;
  }
  const sorted1 = [...seasons1].sort((a, b) => a - b);
  const sorted2 = [...seasons2].sort((a, b) => a - b);
  return sorted1.every((val, index) => val === sorted2[index]);
}
