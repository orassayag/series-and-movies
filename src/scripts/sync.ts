import { settings } from '../settings.js';
import { FileScanner, FileWriter, DuplicateRemover } from '../core';
import { formatEntry, getOutputPath, ensureDirectoryExists } from '../utils';
import { ParsedFile } from '../types';

export async function sync() {
  try {
    console.log('===SCANNING FILES START===');
    const scanner = new FileScanner();
    const filesToSync: Array<{
      name: string;
      sourcePath: string;
      shouldSync: boolean;
    }> = [
      { name: 'series', sourcePath: settings.seriesFilePath, shouldSync: settings.syncSeries },
      { name: 'movies', sourcePath: settings.moviesFilePath, shouldSync: settings.syncMovies },
      { name: 'ww2', sourcePath: settings.ww2FilePath, shouldSync: settings.syncWW2 },
    ];
    const scanResults: Array<{
      name: string;
      sourcePath: string;
      parsedFile: ParsedFile;
    }> = [];
    for (const file of filesToSync) {
      if (file.shouldSync) {
        const parsedFile = await scanner.scanFile(file.sourcePath);
        scanResults.push({ name: file.name, sourcePath: file.sourcePath, parsedFile });
      } else {
        console.log(`Skipping ${file.name} (disabled in settings)`);
      }
    }
    console.log('===SCANNING FILES COMPLETE===');
    if (scanResults.length === 0) {
      console.log('\nNo files to sync. All files are disabled in settings.');
      return;
    }
    const remover = new DuplicateRemover();
    const results = scanResults.map((result) => ({
      ...result,
      removalResult: remover.removeDuplicates(result.parsedFile),
    }));
    const writer = new FileWriter();
    for (const result of results) {
      const outputPath = getOutputPath(result.sourcePath);
      await writer.writeFile(outputPath, result.removalResult.cleanedFile);
    }
    const totalRemoved = results.reduce(
      (sum, result) => sum + result.removalResult.removedEntries.length,
      0
    );
    console.log(`\n===FILES UPDATED===`);
    console.log(`===DUPLICATES REMOVED: ${totalRemoved}===`);
    if (totalRemoved > 0) {
      console.log('===DUPLICATES:===');
      const allRemoved = results.flatMap((result) =>
        result.removalResult.removedEntries.map((e) => ({ ...e, file: result.name }))
      );
      for (const entry of allRemoved) {
        const formattedEntry = formatEntry(entry.name, entry.year, entry.seasons, entry.hebrew, true);
        const reasonText =
          entry.reason === 'duplicate-in-section'
            ? 'duplicate in same section'
            : `already in ${entry.section === 'to-see' ? 'higher priority section' : 'SEEN'}`;
        console.log(`${formattedEntry} (${entry.section.toUpperCase()} - ${reasonText})`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\nError: ${error.message}`);
    } else {
      console.error('\nAn unknown error occurred');
    }
    process.exit(1);
  }
}
