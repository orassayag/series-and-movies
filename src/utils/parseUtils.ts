export function extractName(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) {
    return '';
  }
  const lastOpenParen = trimmed.lastIndexOf('(');
  const lastCloseParen = trimmed.lastIndexOf(')');
  const colonIndex = trimmed.indexOf(':');
  if (lastOpenParen === -1 || lastCloseParen === -1) {
    if (colonIndex !== -1) {
      const afterColon = trimmed.substring(colonIndex + 1).trim();
      if (/^[\d,\s]+$/.test(afterColon)) {
        return trimmed.substring(0, colonIndex).trim();
      }
    }
    return trimmed;
  }
  if (colonIndex === -1 || colonIndex > lastOpenParen) {
    return trimmed.substring(0, lastOpenParen).trim();
  }
  const betweenColonAndParen = trimmed.substring(colonIndex + 1, lastOpenParen).trim();
  if (/^[\d,\s]*$/.test(betweenColonAndParen)) {
    return trimmed.substring(0, colonIndex).trim();
  }
  const lastColonBeforeParen = trimmed.substring(0, lastOpenParen).lastIndexOf(':');
  if (lastColonBeforeParen !== -1) {
    const checkBetween = trimmed.substring(lastColonBeforeParen + 1, lastOpenParen).trim();
    if (/^[\d,\s]*$/.test(checkBetween)) {
      return trimmed.substring(0, lastColonBeforeParen).trim();
    }
  }
  return trimmed.substring(0, lastOpenParen).trim();
}

export function extractYear(line: string): number | undefined {
  const yearMatch = line.match(/\b(19\d{2}|20\d{2})\b/);
  return yearMatch ? parseInt(yearMatch[1], 10) : undefined;
}

export function extractSeasons(line: string): number[] {
  const parenIndex = line.indexOf('(');
  const searchArea = parenIndex === -1 ? line : line.substring(0, parenIndex);
  const colonIndex = searchArea.lastIndexOf(':');
  if (colonIndex === -1) {
    return [];
  }
  const afterColon = searchArea.substring(colonIndex + 1);
  const cleaned = afterColon.trim();
  if (!cleaned) {
    return [];
  }
  const seasons = cleaned
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));
  return [...new Set(seasons)].sort((a, b) => a - b);
}

export function extractHebrew(line: string): string {
  const lastOpenParen = line.lastIndexOf('(');
  const lastCloseParen = line.lastIndexOf(')');
  if (lastOpenParen === -1 || lastCloseParen === -1 || lastOpenParen >= lastCloseParen) {
    return '';
  }
  return line.substring(lastOpenParen + 1, lastCloseParen).trim();
}

export function reverseHebrewText(text: string): string {
  if (!text) {
    return text;
  }
  return text.split('').reverse().join('');
}

export function formatEntry(
  name: string,
  year: number | undefined,
  seasons: number[],
  hebrew: string,
  reverse: boolean = false
): string {
  const processedHebrew = hebrew && reverse ? reverseHebrewText(hebrew) : hebrew;
  const hebrewPart = processedHebrew ? ` (${processedHebrew})` : '';
  let namePart = name;
  if (year) {
    const yearStr = year.toString();
    if (!name.endsWith(' ' + yearStr)) {
      namePart = `${name} ${yearStr}`;
    }
  }
  if (seasons.length === 0) {
    return `${namePart}${hebrewPart}`;
  }
  const seasonsPart = seasons.join(', ');
  return `${namePart}: ${seasonsPart}${hebrewPart}`;
}

export function parseSeasonInput(input: string): number[] {
  const cleaned = input.trim();
  if (!cleaned) {
    return [];
  }
  if (!/^[\d,\s-]+$/.test(cleaned)) {
    throw new Error('Seasons must contain only numbers and commas');
  }
  const seasons = cleaned
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));
  const negativeSeasons = seasons.filter((n) => n < 0);
  if (negativeSeasons.length > 0) {
    throw new Error('Seasons cannot be negative numbers');
  }
  const zeroSeasons = seasons.filter((n) => n === 0);
  if (zeroSeasons.length > 0) {
    throw new Error('Seasons must be positive numbers (greater than 0)');
  }
  const tooLargeSeasons = seasons.filter((n) => n > 1000);
  if (tooLargeSeasons.length > 0) {
    throw new Error('Season numbers must be between 1 and 1000');
  }
  return [...new Set(seasons)].sort((a, b) => a - b);
}
