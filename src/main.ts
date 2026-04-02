import { add, sync } from './scripts';

const script = process.argv[2] || 'add';

switch (script) {
  case 'add':
    add();
    break;
  case 'sync':
    sync();
    break;
  default:
    console.error(`Unknown script: ${script}`);
    console.error('Available scripts: add, sync');
    process.exit(1);
}
