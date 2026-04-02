import fs from 'fs';

const filePath = '/Users/orassayag/Downloads/to-see-ww2.txt';
const fileContent = fs.readFileSync(filePath, 'utf-8');
const lines = fileContent.split('\n');

const toSeeSection: string[] = [];
const seenSection: string[] = [];
const israelSection: string[] = [];

let currentSection = '';
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim() === 'TO SEE:') {
    currentSection = 'TO_SEE';
    continue;
  } else if (line.trim() === 'ISRAEL') {
    currentSection = 'ISRAEL';
    continue;
  } else if (line.trim() === 'SEEN:') {
    currentSection = 'SEEN';
    continue;
  } else if (line.trim() === 'NEED TO BE ORGANIZED:') {
    break;
  }
  
  if (line.trim() === '=======' || line.trim() === '===================') {
    continue;
  }
  
  if (currentSection === 'TO_SEE' && line.trim()) {
    toSeeSection.push(line);
  } else if (currentSection === 'ISRAEL' && line.trim()) {
    israelSection.push(line);
  } else if (currentSection === 'SEEN' && line.trim()) {
    seenSection.push(line);
  }
}

const newMovies = [
  "12 o'clock high",
  "1944",
  "633 Squadron",
  "9 April",
  "A Bridge Too Far",
  "All Quiet on the Eastern Front",
  "All Quiet on the Western Front",
  "Attack",
  "Battle for Sevastopol",
  "Battle of Britain",
  "Battle of Moscow",
  "Battle of Neretva",
  "Battle of Peleliu",
  "Battle of the Bulge",
  "Battleground",
  "Best Years of Our Lives",
  "Big Red One",
  "Brest Fortress",
  "Bridge on the River Kwai",
  "Casablanca",
  "Castle Keep",
  "Catch-22",
  "City 44",
  "City of Life and Death",
  "Cross of Iron",
  "Dam Busters",
  "Das Blechtrommel",
  "Das Boot",
  "Der Untergang",
  "Devil's Brigade",
  "Empire of the Sun",
  "Enemy at the Gates",
  "Eye of the Needle",
  "Flags of Our Fathers",
  "From Here to Eternity",
  "Grave of the Fireflies",
  "Hell In The Pacific",
  "Hell to Eternity",
  "Hope and Glory",
  "Ice Cold in Alex",
  "In Harm's Way",
  "Iron Cross",
  "Kelly's Heroes",
  "King Rat",
  "Letters from Iwo Jima",
  "Lore",
  "Lotna",
  "Memphis Belle",
  "Merry Christmas Mr. Lawrence",
  "Miasto 44",
  "My Way",
  "Normandy",
  "Old People Go in Fight",
  "Operation Daybreak",
  "Operation Pacific",
  "PT 109",
  "Red Tails",
  "Rome Open City",
  "Run Silent Run Deep",
  "Saints and Soldiers",
  "Sands of Iwo Jima",
  "Soldaat van Oranje",
  "Stalag 17",
  "Strategic Command",
  "Sunflower",
  "T-34",
  "The Blue Max",
  "The Bridge at Remagen",
  "The Cruel Sea",
  "The Dambusters",
  "The Desert Fox",
  "The Dirty Dozen",
  "The Eagle Has Landed",
  "The Enemy Below",
  "The Longest Day",
  "The Red Thin Line",
  "The Thin Red Line",
  "The Victors",
  "The War Lover",
  "They Were Expendable",
  "Thirty Seconds Over Tokyo",
  "To Hell and Back",
  "Tora! Tora! Tora!",
  "Tuntematon Sotilas",
  "Tuskegee Airmen",
  "Twelve O'clock High",
  "U-571",
  "Unbroken",
  "Virtuti",
  "Von Ryan's Express",
  "War and Remembrance",
  "Westerplatte",
  "Where Eagles Dare",
  "White Tiger",
  "Windtalkers",
  "Winds of War",
  "Yamato",
  "Zwartboek"
];

let output = 'TO SEE:\n';
output += '=======\n';
toSeeSection.forEach(line => {
  output += line + '\n';
});

newMovies.forEach(movie => {
  output += movie + '\n';
});

if (israelSection.length > 0) {
  output += '\nISRAEL\n';
  output += '======\n';
  israelSection.forEach(line => {
    output += line + '\n';
  });
}

output += '\nSEEN:\n';
output += '=====\n';
seenSection.forEach(line => {
  output += line + '\n';
});

const outputPath = '/Users/orassayag/Repos/series-and-movies/to-see-ww2-organized.txt';
fs.writeFileSync(outputPath, output);

console.log(`Created organized file with ${newMovies.length} new movies added to TO SEE section`);
console.log(`Saved to: ${outputPath}`);
