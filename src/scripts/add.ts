import { settings } from '../settings.js';
import { FileScanner, CliPrompt, EntryManager, FileWriter } from '../core/index.js';
import { getOutputPath, ensureDirectoryExists, reverseHebrewText } from '../utils/index.js';
import { ParsedFile, FileType, AddedEntry, SectionType } from '../types/index.js';

function formatEntryDisplay(entry: AddedEntry): string {
  const reversedHebrew = entry.hebrew ? reverseHebrewText(entry.hebrew) : '';
  const hebrewPart = reversedHebrew ? ` (${reversedHebrew})` : '';
  let namePart = entry.name;
  if (entry.year) {
    const yearStr = entry.year.toString();
    if (!entry.name.endsWith(' ' + yearStr)) {
      namePart = `${entry.name} ${yearStr}`;
    }
  }
  if (entry.seasons.length > 0) {
    const seasonsPart = entry.seasons.join(', ');
    return `${namePart}: ${seasonsPart}${hebrewPart}`;
  }
  return `${namePart}${hebrewPart}`;
}

function groupBySection(entries: AddedEntry[]): Record<SectionType, AddedEntry[]> {
  const grouped: Partial<Record<SectionType, AddedEntry[]>> = {};
  for (const entry of entries) {
    if (!grouped[entry.section]) {
      grouped[entry.section] = [];
    }
    grouped[entry.section]!.push(entry);
  }
  return grouped as Record<SectionType, AddedEntry[]>;
}

async function addSingleEntry(
  prompt: CliPrompt,
  targetFile: ParsedFile,
  fileType: FileType,
  manager: EntryManager,
  addedEntries: AddedEntry[]
): Promise<AddedEntry | null> {
  const sectionType = await prompt.promptSection(fileType);
  if (sectionType === 'cancel') {
    return null;
  }
  const sectionData = targetFile.sections.get(sectionType) || {
    header: '',
    entries: [],
  };
  const name = await prompt.promptName();
  const findMatchingEntry = (sectionToSearch: typeof sectionData) => {
    return sectionToSearch.entries.find((entry) => {
      const normalize = (str: string) => str.toLowerCase().trim();
      const normalizedEntry = normalize(entry.name);
      const normalizedInput = normalize(name);
      if (normalizedEntry === normalizedInput) {
        return true;
      }
      if (fileType !== 'series' && normalizedEntry.startsWith(normalizedInput + ' ')) {
        const afterName = normalizedEntry.substring(normalizedInput.length + 1);
        if (/^\d{4}$/.test(afterName)) {
          return true;
        }
      }
      return false;
    });
  };
  const existingInTargetSection = findMatchingEntry(sectionData);
  let existingEntryFromOtherSection = null;
  if (!existingInTargetSection) {
    for (const [sectionKey, sectionInfo] of targetFile.sections.entries()) {
      if (sectionKey !== sectionType) {
        const found = findMatchingEntry(sectionInfo);
        if (found) {
          existingEntryFromOtherSection = found;
          break;
        }
      }
    }
  }
  const existingEntry = existingInTargetSection || existingEntryFromOtherSection;
  const year = fileType !== 'series' 
    ? (existingEntry?.year || await prompt.promptYear())
    : 0;
  const alreadyAddedInSession = addedEntries.find((entry) => {
    const normalize = (str: string) => str.toLowerCase().trim();
    if (fileType === 'series') {
      return (
        normalize(entry.name) === normalize(name) &&
        entry.section === sectionType
      );
    }
    return (
      normalize(entry.name) === normalize(name) &&
      entry.year === year &&
      entry.section === sectionType
    );
  });
  if (alreadyAddedInSession) {
    if (fileType === 'series') {
      throw new Error(
        `Entry "${name}" already added to ${sectionType} section in this session`
      );
    }
    throw new Error(
      `Entry "${name} ${year}" already added to ${sectionType} section in this session`
    );
  }
  if (existingInTargetSection && fileType !== 'series') {
    throw new Error(`Movie "${existingInTargetSection.name}" already exists in ${sectionType} section`);
  }
  const seasons = fileType === 'series' ? await prompt.promptSeasons() : [];
  const hebrew = existingEntry?.hebrew || await prompt.promptHebrew();
  const finalName = existingEntry?.name || name;
  const input = {
    fileType,
    section: sectionType,
    name: finalName,
    year,
    seasons,
    hebrew,
  };
  manager.addOrUpdateEntry(targetFile, input);
  return {
    name: finalName,
    year,
    seasons,
    hebrew,
    section: sectionType,
  };
}

export async function add() {
  try {
    console.log('===SCANNING FILES START===');
    const scanner = new FileScanner();
    const seriesFile = await scanner.scanFile(settings.seriesFilePath);
    const moviesFile = await scanner.scanFile(settings.moviesFilePath);
    const ww2File = await scanner.scanFile(settings.ww2FilePath);
    console.log('===SCANNING FILES COMPLETE===');
    const prompt = new CliPrompt();
    const fileType = await prompt.promptFileType();
    let targetFile: ParsedFile;
    let sourceFilePath: string;
    if (fileType === 'series') {
      targetFile = seriesFile;
      sourceFilePath = settings.seriesFilePath;
    } else if (fileType === 'movie') {
      targetFile = moviesFile;
      sourceFilePath = settings.moviesFilePath;
    } else {
      targetFile = ww2File;
      sourceFilePath = settings.ww2FilePath;
    }
    const manager = new EntryManager();
    const addedEntries: AddedEntry[] = [];
    let continueAdding = true;
    const MAX_BULK_ENTRIES = 100;
    while (continueAdding) {
      if (addedEntries.length >= MAX_BULK_ENTRIES) {
        console.log(`\nMaximum bulk limit reached (${MAX_BULK_ENTRIES} entries).`);
        console.log('Changes will now be saved.');
        break;
      }
      try {
        const entry = await addSingleEntry(prompt, targetFile, fileType, manager, addedEntries);
        if (entry) {
          addedEntries.push(entry);
          console.log(`\nSuccessfully added/updated "${entry.name}" in ${entry.section} section.\n`);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`\nError: ${error.message}\n`);
        } else {
          console.error('\nAn unknown error occurred\n');
        }
      }
      if (addedEntries.length < MAX_BULK_ENTRIES) {
        continueAdding = await prompt.promptAddMore(fileType);
      }
    }
    if (addedEntries.length === 0) {
      const label = fileType === 'series' ? 'Series' : fileType === 'movie' ? 'Movies' : 'WW2 movies';
      console.log(`\nNo ${label} were added.`);
      return;
    }
    console.log('\n' + '='.repeat(50));
    console.log('PREVIEW OF CHANGES');
    console.log('='.repeat(50));
    const grouped = groupBySection(addedEntries);
    for (const [section, entries] of Object.entries(grouped)) {
      console.log(`\n${section.toUpperCase()} (${entries.length} entries):`);
      for (const entry of entries) {
        const display = formatEntryDisplay(entry);
        console.log(`  - ${display}`);
      }
    }
    console.log('\n' + '='.repeat(50));
    const confirmed = await prompt.promptConfirmWrite();
    if (!confirmed) {
      console.log('\nChanges discarded. No files were modified.');
      return;
    }
    const writer = new FileWriter();
    const outputPath = getOutputPath(sourceFilePath);
    await writer.writeFile(outputPath, targetFile);
    for (const [section, entries] of Object.entries(grouped)) {
      console.log(`\nSuccessfully added/updated in ${section} section:`);
      for (const entry of entries) {
        const display = formatEntryDisplay(entry);
        console.log(display);
      }
    }
    console.log(`\nFile updated: ${outputPath}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\nError: ${error.message}`);
    } else {
      console.error('\nAn unknown error occurred');
    }
    process.exit(1);
  }
}
