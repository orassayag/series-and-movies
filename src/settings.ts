import { Settings } from './types';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKSPACE_ROOT = join(__dirname, '..');

export const settings: Settings = {
  seriesFilePath: '/Users/orassayag/Downloads/to-see-series.txt',
  moviesFilePath: '/Users/orassayag/Downloads/to-see-movies.txt',
  ww2FilePath: '/Users/orassayag/Downloads/to-see-ww2.txt',
  outputDir: join(WORKSPACE_ROOT, 'dist'),
  syncSeries: true,
  syncMovies: true,
  syncWW2: false,
};
