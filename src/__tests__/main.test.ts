import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { main } from '../main.js';
import { add, sync } from '../scripts/index.js';

vi.mock('../scripts/index.js', () => ({
  add: vi.fn(),
  sync: vi.fn(),
}));

describe('main', () => {
  let exitSpy: any;
  let consoleErrorSpy: any;
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.clearAllMocks();
    exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should call add() when no script is specified', async () => {
    process.argv = ['node', 'main.ts'];
    await main();
    expect(add).toHaveBeenCalled();
  });

  it('should call add() when "add" is specified', async () => {
    process.argv = ['node', 'main.ts', 'add'];
    await main();
    expect(add).toHaveBeenCalled();
  });

  it('should call sync() when "sync" is specified', async () => {
    process.argv = ['node', 'main.ts', 'sync'];
    await main();
    expect(sync).toHaveBeenCalled();
  });

  it('should exit with 1 and show error when unknown script is specified', async () => {
    process.argv = ['node', 'main.ts', 'unknown'];
    await main();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown script: unknown')
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
