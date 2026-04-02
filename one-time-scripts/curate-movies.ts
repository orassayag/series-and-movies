import fs from 'fs';

const filePath = '/Users/orassayag/Downloads/to-see-ww2.txt';
const fileContent = fs.readFileSync(filePath, 'utf-8');
const lines = fileContent.split('\n');

const toSeeMovies: string[] = [];
const seenMovies: string[] = [];

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
    break;
  }
  if (line && line !== '=======' && line !== '===================') {
    if (currentSection === 'TO_SEE') {
      toSeeMovies.push(line.toLowerCase());
    } else if (currentSection === 'SEEN') {
      seenMovies.push(line.toLowerCase());
    }
  }
}

const candidateMovies = [
  "Battle of Britain",
  "Stalingrad",
  "Hacksaw Ridge",
  "Dunkirk",
  "The Imitation Game",
  "The Longest Day",
  "A Bridge Too Far",
  "Tora! Tora! Tora!",
  "Cross of Iron",
  "Enemy at the Gates",
  "Come and See",
  "Where Eagles Dare",
  "Kelly's Heroes",
  "The Bridge at Remagen",
  "U-571",
  "Valkyrie",
  "Battle of the Bulge",
  "Midway",
  "The Guns of Navarone",
  "Empire of the Sun",
  "T-34",
  "Stalag 17",
  "12 o'clock high",
  "White Tiger",
  "Brest Fortress",
  "Old People Go in Fight",
  "Memphis Belle",
  "Pearl Harbor",
  "Battleground",
  "Hell to Eternity",
  "From Here to Eternity",
  "Big Red One",
  "The Desert Fox",
  "Grave of the Fireflies",
  "Iron Cross",
  "Eye of the Needle",
  "Operation Daybreak",
  "Saints and Soldiers",
  "Von Ryan's Express",
  "Windtalkers",
  "The Blue Max",
  "Merry Christmas Mr. Lawrence",
  "King Rat",
  "Fury",
  "The Eagles Has Landed",
  "Kelly's Heros",
  "1944",
  "Miasto 44",
  "Strategic Command",
  "Sands of Iwo Jima",
  "All Quiet on the Eastern Front",
  "To Hell and Back",
  "They Were Expendable",
  "Operation Pacific",
  "In Harm's Way",
  "Hart's War",
  "Run Silent Run Deep",
  "The Dambusters",
  "633 Squadron",
  "PT 109",
  "City of Life and Death",
  "Das Boot",
  "The Great Escape",
  "From Here to Eternity",
  "Zwartboek",
  "Soldaat van Oranje",
  "Das Blechtrommel",
  "Patton",
  "Bridge on the River Kwai",
  "The Dirty Dozen",
  "JoJo Rabbit",
  "Flags of Our Fathers",
  "Battle for Sevastopol",
  "The Best Years of Our Lives",
  "Tuntematon Sotilas",
  "Normandy",
  "Wind Talkers",
  "Devil's Brigade",
  "Rommel",
  "The Eagle Has Landed",
  "My Way",
  "Dam Busters",
  "Darkest Hour",
  "Hell In The Pacific",
  "Lore",
  "Attack",
  "Life Is Beautiful",
  "Letters from Iwo Jima",
  "Yamato",
  "The Boy in the Striped Pajamas",
  "Der Untergang",
  "Red Tails",
  "The Red Thin Line",
  "Hope and Glory",
  "Tuskegee Airmen",
  "Castle Keep",
  "Best Years of Our Lives",
  "Rome Open City",
  "Ice Cold in Alex",
  "The Cruel Sea",
  "The Victors",
  "Conspiracy",
  "Westerplatte",
  "City 44",
  "Lotna",
  "Battle of Neretva",
  "Virtuti",
  "All Quiet on the Western Front",
  "Sunflower",
  "The Thin Red Line",
  "Defiance",
  "Battle of Moscow",
  "Casablanca",
  "Winds of War",
  "War and Remembrance",
  "Thirty Seconds Over Tokyo",
  "Twelve O'clock High",
  "Catch-22",
  "The Enemy Below",
  "Unbroken",
  "The War Lover",
  "Battle of Peleliu",
  "9 April"
];

const moviesToAdd: string[] = [];

candidateMovies.forEach(movie => {
  const movieLower = movie.toLowerCase();
  const movieBase = movie.replace(/\s*\(\d{4}\)$/, '').toLowerCase().trim();
  
  const isInToSee = toSeeMovies.some(existing => {
    const existingBase = existing.toLowerCase().split(/\s+\d{4}/)[0].trim();
    const existingClean = existingBase.replace(/^-+/, '').replace(/^([^(]+)\(.*$/, '$1').trim();
    return existingClean.includes(movieLower) || 
           movieLower.includes(existingClean) || 
           existingClean.includes(movieBase) ||
           movieBase.includes(existingClean);
  });
  
  const isInSeen = seenMovies.some(existing => {
    const existingBase = existing.toLowerCase().split(/\s+\d{4}/)[0].trim();
    const existingClean = existingBase.replace(/^-+/, '').replace(/^([^(]+)\(.*$/, '$1').trim();
    return existingClean.includes(movieLower) || 
           movieLower.includes(existingClean) || 
           existingClean.includes(movieBase) ||
           movieBase.includes(existingClean);
  });
  
  if (!isInToSee && !isInSeen) {
    moviesToAdd.push(movie);
  }
});

moviesToAdd.sort((a, b) => a.localeCompare(b));

console.log(`Found ${moviesToAdd.length} movies to add to TO SEE\n`);
moviesToAdd.forEach(movie => console.log(movie));
