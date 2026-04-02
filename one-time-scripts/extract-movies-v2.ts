import fs from 'fs';

const filePath = '/Users/orassayag/Downloads/to-see-ww2.txt';
const fileContent = fs.readFileSync(filePath, 'utf-8');
const lines = fileContent.split('\n');

const toSeeMovies = new Set<string>();
const seenMovies = new Set<string>();
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
    if (currentSection === 'TO_SEE') {
      const movieName = line.toLowerCase()
        .replace(/^-+/, '')
        .replace(/\s*\d{4}\s*-.*$/, '')
        .replace(/\s*\(\d{4}\).*$/, '')
        .replace(/\s*\(.*?\).*$/, '')
        .trim();
      if (movieName) {
        toSeeMovies.add(movieName);
      }
    } else if (currentSection === 'SEEN') {
      const movieName = line.toLowerCase()
        .replace(/\s*\d{4}\s*\(.*$/, '')
        .replace(/\s*\(\d{4}\).*$/, '')
        .replace(/\s*\(.*?\).*$/, '')
        .trim();
      if (movieName) {
        seenMovies.add(movieName);
      }
    } else if (currentSection === 'NEED_TO_BE_ORGANIZED') {
      needToBeOrganizedRaw.push(line);
    }
  }
}

console.log(`Found ${toSeeMovies.size} unique movies in TO SEE`);
console.log(`Found ${seenMovies.size} unique movies in SEEN`);
console.log(`Found ${needToBeOrganizedRaw.length} lines in NEED TO BE ORGANIZED\n`);

const extractedMovies = new Set<string>();

needToBeOrganizedRaw.forEach(line => {
  const quotedMatches = line.match(/"([^"]+)"/g);
  if (quotedMatches) {
    quotedMatches.forEach(match => {
      const movie = match.replace(/"/g, '').trim();
      if (movie && movie.length > 2 && !movie.includes('?')) {
        extractedMovies.add(movie);
      }
    });
  }
  
  const cleaned = line
    .replace(/"[^"]+"/g, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^-+/, '')
    .replace(/\([^)]*\d{4}[^)]*\)/g, '')
    .replace(/!+$/, '')
    .replace(/\?+$/, '')
    .replace(/\s*\d{4}\s*$/, '')
    .trim();
  
  if (cleaned && 
      cleaned.length > 3 && 
      /^[A-Z0-9]/.test(cleaned) &&
      !/^(also|disappointed|why|how about|you forgot|should definitely|pffft|go check|watchmojo|and where)/i.test(cleaned)) {
    extractedMovies.add(cleaned);
  }
});

console.log(`Extracted ${extractedMovies.size} candidate movies\n`);

const moviesToAdd: string[] = [];

extractedMovies.forEach(movie => {
  const movieLower = movie.toLowerCase().trim();
  
  const isInToSee = Array.from(toSeeMovies).some(existing => {
    return existing.includes(movieLower) || movieLower.includes(existing);
  });
  
  const isInSeen = Array.from(seenMovies).some(existing => {
    return existing.includes(movieLower) || movieLower.includes(existing);
  });
  
  if (!isInToSee && !isInSeen) {
    moviesToAdd.push(movie);
  }
});

moviesToAdd.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

console.log(`${moviesToAdd.length} movies will be added\n`);
console.log('Sample of movies to add:');
moviesToAdd.slice(0, 20).forEach(m => console.log(`  - ${m}`));

fs.writeFileSync('/Users/orassayag/Repos/series-and-movies/movies-to-add-clean.txt', moviesToAdd.join('\n'));
console.log('\nSaved to movies-to-add-clean.txt');
