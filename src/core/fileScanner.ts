import { readFile } from 'fs/promises';
import { ParsedFile, SectionType, ParsedSection, EntryData } from '../types';
import { extractName, extractYear, extractSeasons, extractHebrew } from '../utils';

const SECTION_HEADERS: Record<string, SectionType> = {
  'TO SEE:': 'to-see',
  'SEEN:': 'seen',
  'OTHERS TO SEE:': 'others',
  'ISRAEL:': 'israel',
};

export class FileScanner {
  async scanFile(filePath: string): Promise<ParsedFile> {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const sections = new Map<SectionType, ParsedSection>();
    let currentSection: SectionType | null = null;
    let currentHeader = '';
    for (const line of lines) {
      const trimmed = line.trim();
      const sectionType = SECTION_HEADERS[trimmed];
      if (sectionType) {
        currentSection = sectionType;
        currentHeader = trimmed;
        if (!sections.has(currentSection)) {
          sections.set(currentSection, {
            header: currentHeader,
            entries: [],
          });
        }
        continue;
      }
      if (trimmed.includes('Copy these list') || trimmed.includes('WW2 movies')) {
        currentSection = null;
        continue;
      }
      if (currentSection && trimmed && !trimmed.startsWith('=') && !trimmed.startsWith('-') && !trimmed.startsWith('http')) {
        const name = extractName(trimmed);
        if (name) {
          const entry: EntryData = {
            name,
            year: extractYear(trimmed),
            seasons: extractSeasons(trimmed),
            hebrew: extractHebrew(trimmed),
          };
          sections.get(currentSection)!.entries.push(entry);
        }
      }
    }
    return { sections };
  }
}
