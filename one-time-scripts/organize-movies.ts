import fs from 'fs';
import path from 'path';

const filePath = '/Users/orassayag/Downloads/to-see-ww2.txt';
const fileContent = fs.readFileSync(filePath, 'utf-8');
const lines = fileContent.split('\n');

const toSeeMovies: string[] = [];
const seenMovies: string[] = [];
const needToBeOrganized: string[] = [];

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
  if (line && line !== '=======') {
    if (currentSection === 'TO_SEE') {
      toSeeMovies.push(line.toLowerCase());
    } else if (currentSection === 'SEEN') {
      seenMovies.push(line.toLowerCase());
    } else if (currentSection === 'NEED_TO_BE_ORGANIZED') {
      needToBeOrganized.push(line);
    }
  }
}

const extractedMovies: Set<string> = new Set();

needToBeOrganized.forEach(line => {
  const movieMatches = [
    /^([A-Z][A-Za-z0-9\s:&'',.-]+?)(?:\s*\(?\d{4}\)?)?$/,
    /["']([^"']+)["']/g,
    /^\d+\.\s*(.+?)(?:\s*!+)?$/,
    /^-+\s*(.+)$/,
    /^([A-Z][A-Za-z\s]+)/
  ];
  
  for (const pattern of movieMatches) {
    if (pattern.global) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const movieName = match[1].trim();
        if (movieName && movieName.length > 2 && !movieName.includes('?')) {
          extractedMovies.add(movieName);
        }
      }
    } else {
      const match = line.match(pattern);
      if (match && match[1]) {
        const movieName = match[1].trim();
        if (movieName && movieName.length > 2 && !movieName.includes('should definitely replace')) {
          extractedMovies.add(movieName);
        }
      }
    }
  }
  
  const cleanedLine = line
    .replace(/^-+/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/[!?]+$/, '')
    .replace(/["']/g, '')
    .replace(/\(\d{4}\)/, '')
    .replace(/\(.*?\)/, '')
    .trim();
  
  if (cleanedLine && cleanedLine.length > 3 && !/^(and|also|how about|why|disappointed|shameful|go check|watchmojo|pffft|you forgot)/i.test(cleanedLine)) {
    extractedMovies.add(cleanedLine);
  }
});

const moviesToAdd: string[] = [];

extractedMovies.forEach(movie => {
  const movieLower = movie.toLowerCase();
  const isInToSee = toSeeMovies.some(existing => existing.includes(movieLower) || movieLower.includes(existing.split(/\s+\d{4}/)[0].toLowerCase().trim()));
  const isInSeen = seenMovies.some(existing => existing.includes(movieLower) || movieLower.includes(existing.split(/\s+\d{4}/)[0].toLowerCase().trim()));
  
  if (!isInToSee && !isInSeen && movie.length > 3) {
    moviesToAdd.push(movie);
  }
});

moviesToAdd.sort();

console.log(`Found ${extractedMovies.size} unique movies in NEED TO BE ORGANIZED`);
console.log(`${moviesToAdd.length} movies are not in TO SEE or SEEN sections`);
console.log('\nMovies to add:');
moviesToAdd.forEach(movie => console.log(movie));
