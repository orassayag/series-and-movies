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
      toSeeMoviesSet.add(line.toLowerCase());
    } else if (currentSection === 'SEEN' && line) {
      seenMoviesSet.add(line.toLowerCase());
    } else if (currentSection === 'NEED_TO_BE_ORGANIZED') {
      needToBeOrganizedRaw.push(line);
    }
  }
}

function normalizeMovieName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function isMovieInList(movie: string, list: Set<string>): boolean {
  const normalized = normalizeMovieName(movie);
  for (const existing of list) {
    const existingNorm = normalizeMovieName(existing);
    if (existingNorm.includes(normalized) || normalized.includes(existingNorm)) {
      return true;
    }
  }
  return false;
}

const candidateMovies = new Set<string>();

needToBeOrganizedRaw.forEach(line => {
  const quotedMovies = [...line.matchAll(/"([^"]+)"|''([^'']+)''/g)];
  quotedMovies.forEach(match => {
    const movie = (match[1] || match[2] || '').trim();
    if (movie && movie.length > 2 && !/[?!]+$/.test(movie) && !movie.includes('should definitely')) {
      candidateMovies.add(movie);
    }
  });
  
  const cleanedLine = line
    .replace(/"[^"]+"/g, '')
    .replace(/''[^'']+''/, '')
    .replace(/^\d+[\.)]\s*/, '')
    .replace(/^-+/, '')
    .replace(/\([^)]*\d{4}[^)]*\)/g, '')
    .replace(/\s+\d{4}\s*$/, '')
    .replace(/[!?]+$/, '')
    .replace(/,\s*$/, '')
    .trim();
  
  if (cleanedLine.match(/^[A-Z][A-Za-z0-9\s':&-]+$/) && 
      cleanedLine.length > 3 && 
      cleanedLine.length < 60 &&
      !cleanedLine.match(/^\d+:\d+/) &&
      !cleanedLine.toLowerCase().includes('should') &&
      !cleanedLine.toLowerCase().includes('forgot') &&
      !cleanedLine.toLowerCase().includes('disappointed') &&
      !cleanedLine.toLowerCase().includes('why') &&
      !cleanedLine.toLowerCase().includes('how about')) {
    candidateMovies.add(cleanedLine);
  }
});

const moviesToAdd: string[] = [];

candidateMovies.forEach(movie => {
  if (!isMovieInList(movie, toSeeMoviesSet) && !isMovieInList(movie, seenMoviesSet)) {
    moviesToAdd.push(movie);
  }
});

const uniqueMovies = Array.from(new Set(moviesToAdd.map(m => normalizeMovieName(m))))
  .map(normalized => {
    return moviesToAdd.find(m => normalizeMovieName(m) === normalized)!;
  })
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

console.log(`Movies to add: ${uniqueMovies.length}\n`);
uniqueMovies.forEach(m => console.log(m));

fs.writeFileSync('/Users/orassayag/Repos/series-and-movies/final-movies-to-add.txt', uniqueMovies.join('\n'));
console.log(`\nSaved to final-movies-to-add.txt`);
