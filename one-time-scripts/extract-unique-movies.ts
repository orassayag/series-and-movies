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

function extractMovieTitles(lines: string[]): Set<string> {
  const movies = new Map<string, string>();
  
  lines.forEach(line => {
    const quotedMatches = [...line.matchAll(/"([^"]+)"/g)];
    quotedMatches.forEach(match => {
      const title = match[1].trim();
      if (title && title.length > 2 && !title.includes('?')) {
        const normalized = normalizeTitle(title);
        if (!movies.has(normalized)) {
          movies.set(normalized, title);
        }
      }
    });
    
    const singleQuoteMatches = [...line.matchAll(/''([^'']+)''/g)];
    singleQuoteMatches.forEach(match => {
      const title = match[1].trim();
      if (title && title.length > 2) {
        const normalized = normalizeTitle(title);
        if (!movies.has(normalized)) {
          movies.set(normalized, title);
        }
      }
    });
    
    let cleaned = line
      .replace(/"[^"]+"/g, '')
      .replace(/''[^'']+''/, '')
      .replace(/^\d+[\.)]\s*/, '')
      .replace(/^-+/, '')
      .trim();
    
    const yearMatch = cleaned.match(/^([A-Z][A-Za-z0-9\s':&-]+?)\s*\(?\d{4}\)?/);
    if (yearMatch) {
      const title = yearMatch[1].trim();
      const normalized = normalizeTitle(title);
      if (!movies.has(normalized) && title.length > 3) {
        movies.set(normalized, title);
      }
      return;
    }
    
    if (cleaned.match(/^[A-Z][A-Za-z0-9\s':&-]+$/) && 
        cleaned.length >= 3 && 
        cleaned.length <= 50 &&
        !cleaned.match(/should|forgot|disappointed|^why|^how about|^also|^and where|watchmojo|^are you|^anyone|^any |^all |^at |^about |^add |^again |^always/i)) {
      const normalized = normalizeTitle(cleaned);
      if (!movies.has(normalized)) {
        movies.set(normalized, cleaned);
      }
    }
  });
  
  return new Set(movies.values());
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

console.log('Extracting movie titles from NEED TO BE ORGANIZED section...');
const extractedMovies = extractMovieTitles(needToBeOrganizedRaw);
console.log(`Extracted ${extractedMovies.size} candidate movies\n`);

console.log('Filtering out movies already in TO SEE or SEEN...');
const moviesToAdd = Array.from(extractedMovies).filter(movie => {
  return !isInList(movie, toSeeMoviesSet) && !isInList(movie, seenMoviesSet);
});

const uniqueByNormalized = new Map<string, string>();
moviesToAdd.forEach(movie => {
  const norm = normalizeTitle(movie);
  if (!uniqueByNormalized.has(norm)) {
    uniqueByNormalized.set(norm, movie);
  }
});

const finalList = Array.from(uniqueByNormalized.values())
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

console.log(`\nFinal count: ${finalList.length} unique movies to add\n`);
console.log('First 30 movies:');
finalList.slice(0, 30).forEach(m => console.log(`  ${m}`));

fs.writeFileSync('/Users/orassayag/Repos/series-and-movies/final-movies-to-add.txt', finalList.join('\n'));
console.log(`\nSaved to final-movies-to-add.txt`);

if (finalList.some(m => normalizeTitle(m).includes('panfilov'))) {
  console.log('\n✓ Panfilov\'s men is in the list!');
}
