import { ParsedFile, SectionType, EntryData, RemovedEntry, RemovalResult } from '../types';
import { seasonsEqual } from '../utils';

const SECTION_PRIORITY: Record<SectionType, number> = {
  'to-see': 3,
  others: 2,
  israel: 2,
  seen: 1,
};

export class DuplicateRemover {
  removeDuplicates(parsedFile: ParsedFile): RemovalResult {
    const removedEntries: RemovedEntry[] = [];
    for (const [sectionType, section] of parsedFile.sections.entries()) {
      const removed = this.removeDuplicatesInSection(section.entries, sectionType);
      removedEntries.push(...removed);
    }
    const crossSectionRemoved = this.removeCrossSectionDuplicates(parsedFile);
    removedEntries.push(...crossSectionRemoved);
    return {
      removedEntries,
      cleanedFile: parsedFile,
    };
  }
  private removeDuplicatesInSection(entries: EntryData[], section: SectionType): RemovedEntry[] {
    const removed: RemovedEntry[] = [];
    const seen = new Map<string, number>();
    const toRemove: number[] = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const normalizedName = entry.name.toLowerCase();
      if (seen.has(normalizedName)) {
        toRemove.push(i);
        removed.push({
          name: entry.name,
          seasons: entry.seasons,
          hebrew: entry.hebrew,
          section,
          reason: 'duplicate-in-section',
        });
      } else {
        seen.set(normalizedName, i);
      }
    }
    for (let i = toRemove.length - 1; i >= 0; i--) {
      entries.splice(toRemove[i], 1);
    }
    return removed;
  }
  private removeCrossSectionDuplicates(parsedFile: ParsedFile): RemovedEntry[] {
    const removed: RemovedEntry[] = [];
    const entryMap = new Map<
      string,
      Array<{ section: SectionType; entry: EntryData; index: number }>
    >();
    for (const [sectionType, section] of parsedFile.sections.entries()) {
      section.entries.forEach((entry, index) => {
        const normalizedName = entry.name.toLowerCase();
        if (!entryMap.has(normalizedName)) {
          entryMap.set(normalizedName, []);
        }
        entryMap.get(normalizedName)!.push({ section: sectionType, entry, index });
      });
    }
    for (const [, occurrences] of entryMap.entries()) {
      if (occurrences.length <= 1) {
        continue;
      }
      const isMovie = occurrences[0].entry.seasons.length === 0;
      if (isMovie) {
        const toRemoveFromSections = this.handleMovieDuplicates(occurrences);
        for (const { section, entry } of toRemoveFromSections) {
          removed.push({
            name: entry.name,
            seasons: entry.seasons,
            hebrew: entry.hebrew,
            section,
            reason: 'cross-section-priority',
          });
        }
        this.removeEntriesFromSections(parsedFile, toRemoveFromSections);
      } else {
        const result = this.handleSeriesDuplicates(occurrences, parsedFile);
        removed.push(...result.removed);
        this.removeEntriesFromSections(parsedFile, result.toRemove);
      }
    }
    return removed;
  }
  private handleMovieDuplicates(
    occurrences: Array<{ section: SectionType; entry: EntryData; index: number }>
  ): Array<{ section: SectionType; entry: EntryData; index: number }> {
    const highestPriority = Math.max(...occurrences.map((o) => SECTION_PRIORITY[o.section]));
    return occurrences.filter((o) => SECTION_PRIORITY[o.section] < highestPriority);
  }
  private handleSeriesDuplicates(
    occurrences: Array<{ section: SectionType; entry: EntryData; index: number }>,
    parsedFile: ParsedFile
  ): {
    toRemove: Array<{ section: SectionType; entry: EntryData; index: number }>;
    removed: RemovedEntry[];
  } {
    const toRemove: Array<{ section: SectionType; entry: EntryData; index: number }> = [];
    const removed: RemovedEntry[] = [];
    for (let i = 0; i < occurrences.length; i++) {
      for (let j = i + 1; j < occurrences.length; j++) {
        const first = occurrences[i];
        const second = occurrences[j];
        const firstPriority = SECTION_PRIORITY[first.section];
        const secondPriority = SECTION_PRIORITY[second.section];
        if (seasonsEqual(first.entry.seasons, second.entry.seasons)) {
          if (firstPriority < secondPriority) {
            if (!toRemove.find((r) => r.section === first.section && r.index === first.index)) {
              toRemove.push(first);
              removed.push({
                name: first.entry.name,
                seasons: [...first.entry.seasons],
                hebrew: first.entry.hebrew,
                section: first.section,
                reason: 'cross-section-priority',
              });
            }
          } else if (secondPriority < firstPriority) {
            if (!toRemove.find((r) => r.section === second.section && r.index === second.index)) {
              toRemove.push(second);
              removed.push({
                name: second.entry.name,
                seasons: [...second.entry.seasons],
                hebrew: second.entry.hebrew,
                section: second.section,
                reason: 'cross-section-priority',
              });
            }
          }
        } else {
          const hasOverlap = first.entry.seasons.some((s) => second.entry.seasons.includes(s));
          if (hasOverlap && firstPriority !== secondPriority) {
            const lowerPriorityOccurrence = firstPriority < secondPriority ? first : second;
            const higherPrioritySeasons =
              firstPriority > secondPriority ? first.entry.seasons : second.entry.seasons;
            const uniqueSeasons = lowerPriorityOccurrence.entry.seasons.filter(
              (s) => !higherPrioritySeasons.includes(s)
            );
            if (uniqueSeasons.length === 0) {
              if (
                !toRemove.find(
                  (r) =>
                    r.section === lowerPriorityOccurrence.section &&
                    r.index === lowerPriorityOccurrence.index
                )
              ) {
                toRemove.push(lowerPriorityOccurrence);
                removed.push({
                  name: lowerPriorityOccurrence.entry.name,
                  seasons: [...lowerPriorityOccurrence.entry.seasons],
                  hebrew: lowerPriorityOccurrence.entry.hebrew,
                  section: lowerPriorityOccurrence.section,
                  reason: 'cross-section-priority',
                });
              }
            } else {
              const actualEntry = parsedFile.sections.get(lowerPriorityOccurrence.section)?.entries[
                lowerPriorityOccurrence.index
              ];
              if (actualEntry) {
                actualEntry.seasons = uniqueSeasons.sort((a, b) => a - b);
              }
            }
          }
        }
      }
    }
    return { toRemove, removed };
  }
  private removeEntriesFromSections(
    parsedFile: ParsedFile,
    toRemove: Array<{ section: SectionType; entry: EntryData; index: number }>
  ): void {
    const removalMap = new Map<SectionType, number[]>();
    for (const { section, index } of toRemove) {
      if (!removalMap.has(section)) {
        removalMap.set(section, []);
      }
      removalMap.get(section)!.push(index);
    }
    for (const [sectionType, indices] of removalMap.entries()) {
      const section = parsedFile.sections.get(sectionType);
      if (section) {
        const sortedIndices = indices.sort((a, b) => b - a);
        for (const index of sortedIndices) {
          section.entries.splice(index, 1);
        }
      }
    }
  }
}
