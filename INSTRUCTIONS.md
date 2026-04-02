# Instructions for Series and Movies Manager

This document provides detailed instructions for using the Series and Movies Manager CLI tool.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Add Script](#add-script)
- [Sync Script](#sync-script)
- [File Format](#file-format)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Installation

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/series-and-movies.git
   cd series-and-movies
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the project:
   ```bash
   pnpm build
   ```

4. Configure your file paths in `src/settings.ts`

## Configuration

Edit `src/settings.ts` to configure the tool:

```typescript
export const settings: Settings = {
  // Input file paths (source files to read from)
  seriesFilePath: '/Users/username/Downloads/to-see-series.txt',
  moviesFilePath: '/Users/username/Downloads/to-see-movies.txt',
  ww2FilePath: '/Users/username/Downloads/to-see-ww2.txt',
  
  // Output directory (generated files)
  outputDir: join(WORKSPACE_ROOT, 'dist'),
  
  // Sync toggles (enable/disable per file type)
  syncSeries: true,
  syncMovies: true,
  syncWW2: true,
};
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `seriesFilePath` | string | Path to series text file |
| `moviesFilePath` | string | Path to movies text file |
| `ww2FilePath` | string | Path to WW2 movies text file |
| `outputDir` | string | Directory for output files (default: `dist/`) |
| `syncSeries` | boolean | Enable/disable series file syncing |
| `syncMovies` | boolean | Enable/disable movies file syncing |
| `syncWW2` | boolean | Enable/disable WW2 file syncing |

## Add Script

The add script allows you to add entries to your collection interactively with bulk addition support.

### Usage

```bash
pnpm run add
```

### Interactive Flow

1. **Select File Type** (use arrow keys):
   - Series
   - Movie
   - WW2 Movie

2. **Select Section** (use arrow keys):
   - **For Series**: To see / Seen / Others to see
   - **For Movies**: To see / Seen / Israel
   - **For WW2 Movies**: To see / Seen

3. **Enter Name**:
   - Type the entry name
   - Press Enter
   - If empty, you'll be asked again
   - **For movies**: Can type with or without year (e.g., "Halloween" or "Halloween 2018")

4. **Enter Year** (Movies/WW2 only):
   - Type the 4-digit year (1900-2100)
   - **Auto-skipped** if entry already exists and has a year

5. **Enter Seasons** (Series only):
   - Format: `1,2,3,4`
   - Comma-separated numbers (1-1000)
   - Must be positive integers
   - Press Enter to skip (no seasons)

6. **Enter Hebrew Name** (optional):
   - Type the Hebrew translation
   - Press Enter to skip
   - **Auto-skipped** if entry already exists

6. **Add More?** (use arrow keys):
   - Yes: Add another entry (same file type)
   - No: Preview changes and confirm write

7. **Preview and Confirm**:
   - Review all additions grouped by section
   - Choose "Yes" to write changes or "No" to discard

### Bulk Addition

The add script supports adding multiple entries in one session:

- After each successful addition, you'll be asked if you want to add more
- You can add up to 100 entries per session
- All changes are accumulated in memory
- Preview all changes before writing
- Confirm or discard all changes at once
- If an error occurs, previous additions are kept
- Final summary shows all additions grouped by section

### Example Session

```
===SCANNING FILES START===
===SCANNING FILES COMPLETE===
? What do you want to add? Movie
? Select section: Seen
? Name: Inception

Successfully added/updated "Inception" in seen section.

? Would you like to add more Movies? Yes
? Select section: To see
? Name: Interstellar
? Hebrew name (optional): בין כוכבים

Successfully added/updated "Interstellar" in to-see section.

? Would you like to add more Movies? No

==================================================
PREVIEW OF CHANGES
==================================================

SEEN (1 entries):
  - Inception 2010 (התחלה)

TO-SEE (1 entries):
  - Interstellar 2014 (בין כוכבים)

==================================================
? Write these changes to file? Yes

Successfully added/updated in seen section:
Inception 2010 (התחלה)

Successfully added/updated in to-see section:
Interstellar 2014 (בין כוכבים)

Output written to: /Users/username/Repos/series-and-movies/dist/to-see-movies.txt
```

### Add Script Behavior

#### New Entry
- Entry is added to the beginning of the selected section
- Hebrew name is required (unless skipped)

#### Existing Entry - Same Section
- **Series**: Seasons are merged and sorted
- **Movies**: Error thrown (duplicate in same section)

#### Existing Entry - Different Section
- **Series with same seasons**: Entry is moved to target section
- **Series with different seasons**: Entry remains in both sections
- **Series with overlapping seasons**: Overlapping seasons removed from source section
- **Movies**: Entry is moved to target section
- Hebrew name is reused from existing entry

### Validation Rules

1. **Name**: 
   - Cannot be empty
   - Maximum 1000 characters
   - Automatically trimmed
2. **Year** (Movies/WW2 only):
   - Must be a number between 1900-2100
   - Reused from existing entry if available
3. **Seasons** (Series only): 
   - Only numbers and commas allowed
   - No negative numbers or zero
   - Must be between 1-1000
   - Automatically sorted and deduplicated
4. **Hebrew** (optional):
   - Must contain primarily Hebrew characters
   - Numbers, spaces, and punctuation allowed
   - No English letters
   - Automatically trimmed
   - Reused from existing entry if available
5. **Duplicate Detection**: 
   - Case-insensitive matching
   - Name trimming applied
   - Movies: Smart year matching
6. **Bulk Session**:
   - Maximum 100 entries per session
   - No duplicate entries within same session

## Sync Script

The sync script removes duplicates and cleans up your collection files.

### Usage

```bash
pnpm run sync
```

### Sync Behavior

#### Within Same Section
- **Rule**: Keep first occurrence, remove rest
- **Example**:
  ```
  Before: Black Mirror: 1,2,3
          Black Mirror: 1,2,3
  After:  Black Mirror: 1,2,3
  ```

#### Across Sections - Movies
- **Rule**: Keep in highest priority section (TO SEE > OTHERS/ISRAEL > SEEN)
- **Example**:
  ```
  Before: TO SEE: Interstellar
          SEEN: Interstellar
  After:  TO SEE: Interstellar
  ```

#### Across Sections - Series (Same Seasons)
- **Rule**: Keep in TO SEE section, remove from others
- **Example**:
  ```
  Before: TO SEE: Black Mirror: 1,2
          SEEN: Black Mirror: 1,2
  After:  TO SEE: Black Mirror: 1,2
  ```

#### Across Sections - Series (Overlapping Seasons)
- **Rule**: TO SEE has priority, remove overlaps from lower priority sections
- **Example**:
  ```
  Before: TO SEE: Black Mirror: 1,2,3
          SEEN: Black Mirror: 3,4,5
  After:  TO SEE: Black Mirror: 1,2,3
          SEEN: Black Mirror: 4,5
  ```

### Sync Output

```
===SCANNING FILES START===
===SCANNING FILES COMPLETE===

===OUTPUT FILES WRITTEN TO: /path/to/dist===
===DUPLICATES REMOVED: 5===
===DUPLICATES:===
Black Mirror: 3 (SEEN - already in TO SEE)
Interstellar (TO-SEE - duplicate in same section)
```

### Selective Syncing

You can disable syncing for specific file types:

```typescript
// src/settings.ts
export const settings = {
  // ...
  syncSeries: false,  // Skip series file
  syncMovies: true,   // Sync movies file
  syncWW2: true,      // Sync WW2 file
};
```

Output when a file is skipped:
```
===SCANNING FILES START===
Skipping series (disabled in settings)
===SCANNING FILES COMPLETE===
```

## File Format

### Structure

Files must follow this format:

```
TO SEE:
=======
Entry 1
Entry 2

SEEN:
=====
Entry 3

OTHERS TO SEE:  (Series only)
==============
Entry 4

ISRAEL:  (Movies only)
=======
Entry 5
```

### Entry Format

#### Series
```
Name: seasons (Hebrew)
```
Examples:
- `Black Mirror: 1, 2, 3 (מראה שחורה)`
- `Breaking Bad: 1, 2, 3, 4, 5 (שובר שורות)`
- `Dahmer - Monster: The Jeffrey Dahmer Story: 1 (מפלצת: סיפורו של ג'פרי דאהמר)`

**Note**: Season numbers are extracted after the LAST colon, so series names can contain colons.

#### Movies
```
Name year (Hebrew)
```
Examples:
- `Inception 2010 (התחלה)`
- `Interstellar 2014 (בין כוכבים)`
- `Halloween 2018 (האלווין)`

### Important Notes

- Hebrew text in parentheses is optional
- Year in movie names is optional but recommended
- Seasons must be comma-separated numbers
- Empty lines between sections are allowed
- Lines starting with `=` or `-` are treated as section separators

## Common Workflows

### Adding a New Series

```bash
pnpm run add
# Select: Series
# Section: To see
# Name: Breaking Bad
# Seasons: 1,2,3
# Hebrew: שובר שורות
```

### Adding Multiple Movies at Once

```bash
pnpm run add
# Select: Movie
# Add first movie...
# Select: Yes (add more)
# Add second movie...
# Select: Yes (add more)
# Add third movie...
# Select: No (done)
```

### Updating Series Seasons

```bash
pnpm run add
# Select: Series
# Section: To see
# Name: Breaking Bad  (already exists with seasons 1,2,3)
# Seasons: 4,5
# Result: Breaking Bad: 1, 2, 3, 4, 5
```

### Moving Movie Between Sections

```bash
pnpm run add
# Select: Movie
# Section: Seen
# Name: Inception  (exists in To see)
# Hebrew prompt is skipped
# Result: Movie moved from To see to Seen
```

### Cleaning Up Duplicates

```bash
pnpm run sync
# Reviews all files
# Removes duplicates
# Shows summary of removals
# Writes cleaned files to dist/
```

## Troubleshooting

### Problem: "File not found" error

**Solution**: Check file paths in `src/settings.ts` are correct and files exist

### Problem: Error "already exists in section"

**Cause**: You're trying to add a movie that already exists in the same section

**Solution**: 
- If you want to move it, select a different section
- If you want to update it (series), add new seasons
- If it's truly a duplicate, skip it

### Problem: Seasons not merging

**Cause**: You might be adding to a different section

**Solution**: Make sure you're selecting the same section where the entry exists

### Problem: Hebrew text displays incorrectly

**Cause**: Terminal doesn't support RTL text properly

**Note**: The tool reverses Hebrew text for proper RTL display in LTR terminals

### Problem: "No files to sync" message

**Cause**: All sync flags are disabled in settings

**Solution**: Enable at least one sync flag in `src/settings.ts`:
```typescript
syncSeries: true,  // Enable this
syncMovies: true,  // Or this
syncWW2: true,     // Or this
```

### Problem: Original files getting modified

**This shouldn't happen!** All output goes to `dist/` folder.

**If it does**: Please report this as a bug immediately.

## Best Practices

### File Management

1. **Backup regularly**: Keep backups of your original files
2. **Review dist output**: Always check generated files before replacing originals
3. **Use sync periodically**: Run sync script regularly to clean up duplicates

### Data Entry

1. **Consistent naming**: Use consistent naming conventions for entries
2. **Include years**: Add years to movie names for better identification
3. **Hebrew names**: Add Hebrew translations when available
4. **Verify before adding**: Check if entry already exists to avoid duplicates

### Workflow Recommendations

1. **Add first, sync later**: Add all new entries, then run sync to clean up
2. **Test with copies**: Test on copies of your files first
3. **Review sync output**: Always review what sync removes before replacing files
4. **Use bulk addition**: Add multiple entries in one session for efficiency

### Performance Tips

1. **Split large files**: If files become very large, consider splitting by category
2. **Run sync regularly**: Don't let duplicates accumulate
3. **Use selective sync**: Disable sync for files that don't need it

## Advanced Usage

### Custom Section Priorities

Section priorities are hardcoded in `src/core/duplicateRemover.ts`:

```typescript
const SECTION_PRIORITY: Record<SectionType, number> = {
  'to-see': 3,    // Highest priority
  'others': 2,
  'israel': 2,
  'seen': 1,      // Lowest priority
};
```

To modify priorities, edit this file and rebuild.

### Output Directory

Change output directory in `src/settings.ts`:

```typescript
outputDir: '/custom/path/to/output',
```

### Testing Changes

```bash
# Run tests
pnpm test

# Run specific test
pnpm test parseUtils

# Watch mode
pnpm test:watch
```

## Getting Help

- **Documentation**: See README.md for overview
- **Contributing**: See CONTRIBUTING.md for development guidelines
- **Issues**: Open an issue on GitHub for bugs or questions
- **Email**: Contact the maintainer for urgent issues

## Version History

See CHANGELOG.md (if available) for version history and breaking changes.
