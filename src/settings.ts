import { Settings } from './types';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKSPACE_ROOT = join(__dirname, '..');

export const settings: Settings = {
  seriesFilePath: 'C:\\Users\\Or Assayag\\Dropbox\\or-life\\documents\\daily\\to-see-series.txt',
  moviesFilePath: 'C:\\Users\\Or Assayag\\Dropbox\\or-life\\documents\\daily\\to-see-movies.txt',
  ww2FilePath: 'C:\\Users\\Or Assayag\\Dropbox\\or-life\\documents\\daily\\to-see-ww2.txt',
  syncSeries: true,
  syncMovies: true,
  syncWW2: false,
};
