import fs from 'fs';

const filePath = '/Users/orassayag/Downloads/to-see-ww2.txt';
const fileContent = fs.readFileSync(filePath, 'utf-8');
const lines = fileContent.split('\n');

const toSeeMoviesSet = new Set<string>();
const seenMoviesSet = new Set<string>();
const needToBeOrganizedRaw: string[] = [];

let currentSection = '';
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line === 'TO SEE:') {
    currentSection = 'TO_SEE';
    continue;
  } else if (line === 'SEEN:') {
    currentSection = 'SEEN';
    continue;
  } else if (line === 'NEED TO BE ORGANIZED:') {
    currentSection = 'NEED_TO_BE_ORGANIZED';
    continue;
  }
  
  if (line && line !== '=======' && line !== '===================') {
    if (currentSection === 'TO_SEE' && line) {
      toSeeMoviesSet.add(line);
    } else if (currentSection === 'SEEN' && line) {
      seenMoviesSet.add(line);
    } else if (currentSection === 'NEED_TO_BE_ORGANIZED') {
      needToBeOrganizedRaw.push(line);
    }
  }
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[,;:.!?]+$/, '')
    .replace(/^-+/, '')
    .replace(/\s*\(\d{4}\).*$/, '')
    .replace(/\s*\d{4}\s*$/, '')
    .trim();
}

function extractMovieTitles(lines: string[]): Map<string, string> {
  const movies = new Map<string, string>();
  
  lines.forEach(line => {
    const quotedMatches = [...line.matchAll(/"([A-Z][^"]{2,48})"/g)];
    quotedMatches.forEach(match => {
      const title = match[1].trim();
      const normalized = normalizeTitle(title);
      if (normalized.length > 2 && !movies.has(normalized)) {
        movies.set(normalized, title);
      }
    });
    
    const singleQuoteMatches = [...line.matchAll(/''([A-Z][^'']{2,48})''/g)];
    singleQuoteMatches.forEach(match => {
      const title = match[1].trim();
      const normalized = normalizeTitle(title);
      if (normalized.length > 2 && !movies.has(normalized)) {
        movies.set(normalized, title);
      }
    });
    
    const dashListMatch = line.match(/^-([A-Z][A-Za-z0-9\s':&-]{2,48})$/);
    if (dashListMatch) {
      const title = dashListMatch[1].trim();
      const normalized = normalizeTitle(title);
      if (!movies.has(normalized)) {
        movies.set(normalized, title);
      }
      return;
    }
    
    const yearMatch = line.match(/^([A-Z][A-Za-z0-9\s':&-]{2,48}?)\s*[\(]?\d{4}[\)]?/);
    if (yearMatch) {
      const title = yearMatch[1].trim();
      const normalized = normalizeTitle(title);
      if (!movies.has(normalized)) {
        movies.set(normalized, title);
      }
      return;
    }
    
    const numberedMatch = line.match(/^\d+[\.)]\s*([A-Z][A-Za-z0-9\s':&-]{2,48})$/);
    if (numberedMatch) {
      const title = numberedMatch[1].trim().replace(/[!?]+$/, '').trim();
      const normalized = normalizeTitle(title);
      if (!movies.has(normalized)) {
        movies.set(normalized, title);
      }
      return;
    }
    
    const standAloneMatch = line.match(/^([A-Z][A-Za-z0-9\s':&-]{2,48})$/);
    if (standAloneMatch && 
        !line.includes(',') &&
        line.split(/\s+/).length <= 8) {
      const title = standAloneMatch[1].trim();
      const normalized = normalizeTitle(title);
      if (!movies.has(normalized)) {
        movies.set(normalized, title);
      }
    }
  });
  
  return movies;
}

function isInList(title: string, list: Set<string>): boolean {
  const normalized = normalizeTitle(title);
  
  for (const existing of list) {
    const existingNorm = normalizeTitle(existing);
    if (normalized === existingNorm || 
        normalized.includes(existingNorm) || 
        existingNorm.includes(normalized)) {
      return true;
    }
  }
  return false;
}

console.log('Extracting movie titles with strict rules...');
const moviesMap = extractMovieTitles(needToBeOrganizedRaw);
console.log(`Extracted ${moviesMap.size} candidate movies\n`);

console.log('Filtering out movies already in TO SEE or SEEN...');
const finalMap = new Map<string, string>();

for (const [normalized, title] of moviesMap) {
  if (!isInList(title, toSeeMoviesSet) && !isInList(title, seenMoviesSet)) {
    finalMap.set(normalized, title);
  }
}

const finalList = Array.from(finalMap.values())
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

console.log(`\nFinal count: ${finalList.length} unique movies to add\n`);
console.log('All movies:');
finalList.forEach(m => console.log(`  ${m}`));

fs.writeFileSync('/Users/orassayag/Repos/series-and-movies/movies-extracted-clean.txt', finalList.join('\n'));
console.log(`\nSaved to movies-extracted-clean.txt`);

const bridgeCount = finalList.filter(m => normalizeTitle(m).includes('bridge') && normalizeTitle(m).includes('far')).length;
console.log(`\nBridge Too Far variations: ${bridgeCount}`);

if (finalList.some(m => normalizeTitle(m).includes('panfilov'))) {
  console.log('✓ Panfilov\'s men is in the list!');
}
