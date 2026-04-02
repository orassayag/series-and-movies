import fs from 'fs';

const filePath = '/Users/orassayag/Downloads/to-see-ww2.txt';
const fileContent = fs.readFileSync(filePath, 'utf-8');
const lines = fileContent.split('\n');

const toSeeMovies: string[] = [];
const seenMovies: string[] = [];
const needToBeOrganizedLines: string[] = [];

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
      needToBeOrganizedLines.push(line);
    }
  }
}

const movieNames: Set<string> = new Set();

needToBeOrganizedLines.forEach(line => {
  line = line.replace(/^-+/, '').trim();
  line = line.replace(/^\d+\.\s*/, '').trim();
  
  const quotedMovies = line.match(/"([^"]+)"/g);
  if (quotedMovies) {
    quotedMovies.forEach(quoted => {
      const movie = quoted.replace(/"/g, '').trim();
      if (movie && !movie.includes('?') && movie.length > 2) {
        movieNames.add(movie);
      }
    });
  }
  
  const singleQuotedMovies = line.match(/''([^'']+)''/g);
  if (singleQuotedMovies) {
    singleQuotedMovies.forEach(quoted => {
      const movie = quoted.replace(/''/g, '').trim();
      if (movie && movie.length > 2) {
        movieNames.add(movie);
      }
    });
  }
  
  const cleanLine = line
    .replace(/"[^"]+"/g, '')
    .replace(/''[^'']+''/, '')
    .replace(/\([^)]*\d{4}[^)]*\)/g, '')
    .replace(/\?+$/, '')
    .replace(/!+$/, '')
    .trim();
  
  if (cleanLine && 
      cleanLine.length > 3 && 
      !/^(also|disappointed|shameful|go check|watchmojo|pffft|why didn|how about|and where)/i.test(cleanLine) &&
      !cleanLine.includes('should definitely replace') &&
      !cleanLine.includes('you forgot') &&
      /^[A-Z0-9]/.test(cleanLine)) {
    const movie = cleanLine.replace(/\s*\(\d{4}\)$/, '').trim();
    if (movie.length > 3) {
      movieNames.add(movie);
    }
  }
});

const moviesToAdd: string[] = [];

movieNames.forEach(movie => {
  const movieLower = movie.toLowerCase();
  const movieBase = movie.replace(/\s*\(\d{4}\)$/, '').toLowerCase().trim();
  
  const isInToSee = toSeeMovies.some(existing => {
    const existingBase = existing.split(/\s+\d{4}/)[0].trim();
    return existing.includes(movieLower) || 
           movieLower.includes(existingBase) || 
           existingBase.includes(movieBase) ||
           movieBase.includes(existingBase);
  });
  
  const isInSeen = seenMovies.some(existing => {
    const existingBase = existing.split(/\s+\d{4}/)[0].trim();
    return existing.includes(movieLower) || 
           movieLower.includes(existingBase) || 
           existingBase.includes(movieBase) ||
           movieBase.includes(existingBase);
  });
  
  if (!isInToSee && !isInSeen) {
    moviesToAdd.push(movie);
  }
});

moviesToAdd.sort((a, b) => a.localeCompare(b));

console.log(`Extracted ${movieNames.size} unique movie names`);
console.log(`${moviesToAdd.length} movies need to be added to TO SEE\n`);
console.log('Movies to add:\n');
moviesToAdd.forEach(movie => console.log(movie));

fs.writeFileSync('/Users/orassayag/Repos/series-and-movies/movies-to-add.txt', moviesToAdd.join('\n'));
console.log('\n\nSaved to movies-to-add.txt');
