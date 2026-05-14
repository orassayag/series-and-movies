import { add, sync } from './scripts';

export async function main() {
  const script = process.argv[2] || 'add';

  switch (script) {
    case 'add':
      await add();
      break;
    case 'sync':
      await sync();
      break;
    default:
      console.error(`Unknown script: ${script}`);
      console.error('Available scripts: add, sync');
      process.exit(1);
  }
}

// Only run if this file is being executed directly
if (import.meta.url.startsWith('file:')) {
  const modulePath = process.argv[1];

  // Simple check to see if we're running this file directly
  // In some environments, pathname might need normalization
  if (
    modulePath &&
    (modulePath.endsWith('main.ts') || modulePath.endsWith('main.js'))
  ) {
    main();
  }
}
