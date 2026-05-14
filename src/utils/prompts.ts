import Enquirer from 'enquirer';
import readline from 'node:readline';
import fs from 'node:fs';
import tty from 'node:tty';

interface SelectChoice<T = string> {
  name: string;
  value: T;
}

export interface SelectConfig<T = string> {
  message: string;
  choices: SelectChoice<T>[];
}

const ESC_GUARD_MS = 200;
let lastEscTimestamp: number | null = null;

let customStdin: any = null;
let customStdout: any = null;

function getInteractiveStreams() {
  if (process.platform === 'win32' && !process.stdin.isTTY) {
    if (!customStdin) {
      try {
        const fdIn = fs.openSync('\\\\.\\CONIN$', 'r+');
        const fdOut = fs.openSync('\\\\.\\CONOUT$', 'w');
        customStdin = new tty.ReadStream(fdIn);
        customStdout = new tty.WriteStream(fdOut);
      } catch (e) {
        return { stdin: process.stdin, stdout: process.stdout };
      }
    }
    return { stdin: customStdin, stdout: customStdout };
  }
  return { stdin: process.stdin, stdout: process.stdout };
}

export function _resetEscState(): void {
  lastEscTimestamp = null;
}

function recordEsc(): void {
  lastEscTimestamp = Date.now();
}

function msSinceLastEsc(): number {
  if (lastEscTimestamp === null) return Infinity;
  const now = Date.now();
  const diff = now - lastEscTimestamp;
  return diff < 0 ? Infinity : diff;
}

function patchCancel(prompt: any): void {
  recordEsc(); // Initialize guard timer
  let cancelled = false;

  prompt.cancel = (_err?: any): any => {
    const age = msSinceLastEsc();
    if (age < ESC_GUARD_MS) {
      return; // swallow phantom cancel from readline timer
    }
    if (cancelled) return;
    cancelled = true;
    recordEsc();

    // Clean up enquirer's internal readline listeners before exiting
    // to prevent the "ERR_USE_AFTER_CLOSE: readline was closed" error
    if (prompt.close) {
      prompt.close();
    }

    console.log('\n👋 Goodbye!');
    process.exit(0);
  };
}

export async function select<T = string>(config: SelectConfig<T>): Promise<T> {
  const { Select } = Enquirer as any;
  const { stdin, stdout } = getInteractiveStreams();

  // Ensure stdin is ready for interactive input
  if (stdin.isTTY) {
    try {
      if (stdin.setRawMode) {
        stdin.setRawMode(true);
      }
    } catch (e) {}
    readline.emitKeypressEvents(stdin);
    stdin.resume();
  }

  const prompt = new Select({
    name: 'value',
    message: config.message,
    choices: config.choices.map((c) => c.name),
    result(name: string): T | undefined {
      return config.choices.find((c) => c.name === name)?.value;
    },
    stdin,
    stdout,
    showCursor: true,
  });

  patchCancel(prompt);

  return await prompt.run();
}

export interface InputConfig {
  message: string;
  validate?: (input: string) => boolean | string | Promise<boolean | string>;
  initial?: string;
}

export async function input(config: InputConfig): Promise<string> {
  const { Input } = Enquirer as any;
  const { stdin, stdout } = getInteractiveStreams();

  // Ensure stdin is ready for interactive input
  if (stdin.isTTY) {
    try {
      if (stdin.setRawMode) {
        stdin.setRawMode(true);
      }
    } catch (e) {}
    readline.emitKeypressEvents(stdin);
    stdin.resume();
  }

  const prompt = new Input({
    name: 'value',
    message: config.message,
    validate: config.validate,
    initial: config.initial,
    stdin,
    stdout,
    showCursor: true,
  });

  patchCancel(prompt);

  return await prompt.run();
}
