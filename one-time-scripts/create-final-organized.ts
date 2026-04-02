import fs from 'fs';

const originalFilePath = '/Users/orassayag/Downloads/to-see-ww2.txt';
const curatedListPath = '/Users/orassayag/Repos/series-and-movies/curated-movies-list.txt';

const originalContent = fs.readFileSync(originalFilePath, 'utf-8');
const originalLines = originalContent.split('\n');

const toSeeLines: string[] = [];
const seenLines: string[] = [];

let currentSection = '';
for (let i = 0; i < originalLines.length; i++) {
  const line = originalLines[i];
  const trimmed = line.trim();
  
  if (trimmed === 'TO SEE:') {
    currentSection = 'TO_SEE';
    continue;
  } else if (trimmed === 'SEEN:') {
    currentSection = 'SEEN';
    continue;
  } else if (trimmed === 'NEED TO BE ORGANIZED:') {
    break;
  }
  
  if (trimmed && trimmed !== '=======' && trimmed !== '===================') {
    if (currentSection === 'TO_SEE') {
      toSeeLines.push(line);
    } else if (currentSection === 'SEEN') {
      seenLines.push(line);
    }
  }
}

const curatedMovies = fs.readFileSync(curatedListPath, 'utf-8')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l);

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^-+/, '')
    .replace(/\s*\(\d{4}\).*$/, '')
    .replace(/\s*\d{4}\s*-.*$/, '')
    .trim();
}

function isInList(movie: string, list: string[]): boolean {
  const normalized = normalizeTitle(movie);
  
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

const moviesToAdd = curatedMovies.filter(movie => {
  return !isInList(movie, toSeeLines) && !isInList(movie, seenLines);
});

const uniqueMovies = new Map<string, string>();
moviesToAdd.forEach(movie => {
  const norm = normalizeTitle(movie);
  if (!uniqueMovies.has(norm)) {
    uniqueMovies.set(norm, movie);
  }
});

const finalList = Array.from(uniqueMovies.values())
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

console.log(`Curated list: ${curatedMovies.length} movies`);
console.log(`After filtering: ${finalList.length} movies to add\n`);
console.log('Movies to add:');
finalList.forEach(m => console.log(`  ${m}`));

let output = 'TO SEE:\n=======\n';
toSeeLines.forEach(line => {
  output += line + '\n';
});
finalList.forEach(movie => {
  output += movie + '\n';
});

output += '\nSEEN:\n=====\n';
seenLines.forEach(line => {
  output += line + '\n';
});

fs.writeFileSync('/Users/orassayag/Repos/series-and-movies/to-see-ww2-final.txt', output);
console.log(`\nCreated final organized file: to-see-ww2-final.txt`);
