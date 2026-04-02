import fs from 'fs';

const filePath = '/Users/orassayag/Repos/series-and-movies/to-see-ww2-organized.txt';
const fileContent = fs.readFileSync(filePath, 'utf-8');
const lines = fileContent.split('\n');

const toSeeLines: string[] = [];
const seenLines: string[] = [];
const seenSet = new Set<string>();
let currentSection = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmedLine = line.trim();
  
  if (trimmedLine === 'TO SEE:') {
    currentSection = 'TO_SEE';
    continue;
  } else if (trimmedLine === 'SEEN:') {
    currentSection = 'SEEN';
    continue;
  }
  
  if (trimmedLine === '=======' || trimmedLine === '===================') {
    continue;
  }
  
  if (currentSection === 'TO_SEE') {
    toSeeLines.push(line);
  } else if (currentSection === 'SEEN') {
    seenLines.push(line);
    if (trimmedLine) {
      seenSet.add(trimmedLine.toLowerCase());
    }
  }
}

const uniqueToSeeLines: string[] = [];
const seenToSee = new Set<string>();

for (const line of toSeeLines) {
  const trimmedLine = line.trim();
  if (!trimmedLine) {
    continue;
  }
  
  const lowerLine = trimmedLine.toLowerCase();
  
  if (!seenToSee.has(lowerLine)) {
    seenToSee.add(lowerLine);
    uniqueToSeeLines.push(line);
  }
}

let output = 'TO SEE:\n';
output += '=======\n';
uniqueToSeeLines.forEach(line => {
  output += line + '\n';
});

output += '\nSEEN:\n';
output += '=====\n';
seenLines.forEach(line => {
  output += line + '\n';
});

const outputPath = '/Users/orassayag/Repos/series-and-movies/to-see-ww2-organized.txt';
fs.writeFileSync(outputPath, output);

const duplicatesRemoved = toSeeLines.filter(l => l.trim()).length - uniqueToSeeLines.length;
console.log(`Removed ${duplicatesRemoved} duplicate entries from TO SEE section`);
console.log(`TO SEE now has ${uniqueToSeeLines.length} unique movies`);
console.log(`SEEN has ${seenLines.filter(l => l.trim()).length} movies`);
