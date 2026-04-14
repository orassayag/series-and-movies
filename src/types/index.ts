export type FileType = 'series' | 'movie' | 'ww2';

export type SectionType = 'to-see' | 'seen' | 'others' | 'israel' | 'cancel';

export interface EntryData {
  name: string;
  year?: number;
  seasons: number[];
  hebrew: string;
}

export interface ParsedSection {
  header: string;
  entries: EntryData[];
}

export interface ParsedFile {
  sections: Map<SectionType, ParsedSection>;
}

export interface Settings {
  seriesFilePath: string;
  moviesFilePath: string;
  ww2FilePath: string;
  syncSeries: boolean;
  syncMovies: boolean;
  syncWW2: boolean;
}

export interface UserInput {
  fileType: FileType;
  section: SectionType;
  name: string;
  year: number;
  seasons: number[];
  hebrew: string;
}

export interface AddedEntry {
  name: string;
  year: number;
  seasons: number[];
  hebrew: string;
  section: SectionType;
}

export interface RemovedEntry {
  name: string;
  year?: number;
  seasons: number[];
  hebrew: string;
  section: SectionType;
  reason: 'duplicate-in-section' | 'cross-section-priority';
}

export interface RemovalResult {
  removedEntries: RemovedEntry[];
  cleanedFile: ParsedFile;
}
