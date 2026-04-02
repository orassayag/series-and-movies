import { ParsedFile, EntryData, UserInput, SectionType } from '../types';
import { namesMatch, mergeSeasons, seasonsEqual } from '../utils';

export class EntryManager {
  addOrUpdateEntry(parsedFile: ParsedFile, input: UserInput): void {
    let section = parsedFile.sections.get(input.section);
    if (!section) {
      section = {
        header: this.getSectionHeader(input.section),
        entries: [],
      };
      parsedFile.sections.set(input.section, section);
    }
    const existingEntryIndex = section.entries.findIndex((entry) =>
      namesMatch(entry.name, input.name)
    );
    if (existingEntryIndex !== -1) {
      const existingEntry = section.entries[existingEntryIndex];
      const mergedSeasons = mergeSeasons(existingEntry.seasons, input.seasons);
      if (seasonsEqual(existingEntry.seasons, mergedSeasons)) {
        if (input.seasons.length === 0) {
          throw new Error(`Entry "${input.name}" already exists in ${input.section}`);
        }
        throw new Error(
          `Entry "${input.name}" with seasons ${input.seasons.join(', ')} already exists in ${input.section}`
        );
      }
      section.entries[existingEntryIndex] = {
        name: input.name,
        year: input.year,
        seasons: mergedSeasons,
        hebrew: input.hebrew || existingEntry.hebrew,
      };
    } else {
      this.checkDuplicateInOtherSections(parsedFile, input);
      const newEntry: EntryData = {
        name: input.name,
        year: input.year,
        seasons: input.seasons,
        hebrew: input.hebrew,
      };
      section.entries.unshift(newEntry);
    }
  }
  private getSectionHeader(section: SectionType): string {
    const headers: Record<SectionType, string> = {
      'to-see': 'TO SEE:',
      seen: 'SEEN:',
      others: 'OTHERS TO SEE:',
      israel: 'ISRAEL:',
    };
    return headers[section];
  }
  private checkDuplicateInOtherSections(parsedFile: ParsedFile, input: UserInput): void {
    for (const [sectionType, section] of parsedFile.sections.entries()) {
      if (sectionType === input.section) {
        continue;
      }
      const existingEntryIndex = section.entries.findIndex((entry) => namesMatch(entry.name, input.name));
      if (existingEntryIndex !== -1) {
        const existingEntry = section.entries[existingEntryIndex];
        if (input.seasons.length === 0 && existingEntry.seasons.length === 0) {
          section.entries.splice(existingEntryIndex, 1);
          return;
        }
        if (input.seasons.length > 0 && existingEntry.seasons.length > 0) {
          const remainingSeasons = existingEntry.seasons.filter(
            (season) => !input.seasons.includes(season)
          );
          if (remainingSeasons.length === 0) {
            section.entries.splice(existingEntryIndex, 1);
          } else {
            section.entries[existingEntryIndex] = {
              ...existingEntry,
              seasons: remainingSeasons,
            };
          }
          return;
        }
        if (seasonsEqual(existingEntry.seasons, input.seasons)) {
          section.entries.splice(existingEntryIndex, 1);
          return;
        }
      }
    }
  }
}
