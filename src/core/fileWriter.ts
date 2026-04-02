import { writeFile } from 'fs/promises';
import { ParsedFile, SectionType } from '../types';
import { formatEntry } from '../utils';

const SECTION_ORDER: SectionType[] = ['to-see', 'others', 'israel', 'seen'];

const SECTION_HEADERS: Record<SectionType, string> = {
  'to-see': 'TO SEE:',
  seen: 'SEEN:',
  others: 'OTHERS TO SEE:',
  israel: 'ISRAEL:',
};

const SECTION_SEPARATORS: Record<SectionType, string> = {
  'to-see': '=======',
  seen: '=====',
  others: '==============',
  israel: '=======',
};

export class FileWriter {
  async writeFile(filePath: string, parsedFile: ParsedFile): Promise<void> {
    const lines: string[] = [];
    const sectionsToWrite = SECTION_ORDER.filter((sectionType) =>
      parsedFile.sections.has(sectionType)
    );
    for (let i = 0; i < sectionsToWrite.length; i++) {
      const sectionType = sectionsToWrite[i];
      const section = parsedFile.sections.get(sectionType)!;
      lines.push(SECTION_HEADERS[sectionType]);
      lines.push(SECTION_SEPARATORS[sectionType]);
      for (const entry of section.entries) {
        const formattedEntry = formatEntry(entry.name, entry.year, entry.seasons, entry.hebrew);
        lines.push(formattedEntry);
      }
      if (i < sectionsToWrite.length - 1) {
        lines.push('');
      }
    }
    const content = lines.join('\n') + '\n';
    await writeFile(filePath, content, 'utf-8');
  }
}
