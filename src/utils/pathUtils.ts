import { join, basename } from 'path';
import { mkdir } from 'fs/promises';

export function getOutputPath(inputPath: string, outputDir: string): string {
  const fileName = basename(inputPath);
  return join(outputDir, fileName);
}

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code !== 'EEXIST') {
      throw error;
    }
  }
}
