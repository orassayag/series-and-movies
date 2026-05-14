import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Enquirer from 'enquirer';
import { select, input, _resetEscState } from '../prompts.js';

vi.mock('enquirer', () => {
  return {
    default: {
      Select: vi.fn(),
      Input: vi.fn(),
    },
  };
});

describe('prompts utility', () => {
  let exitSpy: any;
  let logSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    _resetEscState();
    exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('select', () => {
    it('should run select prompt and return result', async () => {
      vi.mocked((Enquirer as any).Select).mockImplementation(function (
        this: any,
        config: any
      ) {
        this.run = vi
          .fn()
          .mockResolvedValue(
            config.result ? config.result('Choice 1') : 'Choice 1'
          );
        return this;
      } as any);

      const result = await select({
        message: 'Test message',
        choices: [
          { name: 'Choice 1', value: 'value1' },
          { name: 'Choice 2', value: 'value2' },
        ],
      });

      expect(result).toBe('value1');
      expect((Enquirer as any).Select).toHaveBeenCalled();
    });

    it('should handle escape/cancel', async () => {
      let promptInstance: any;
      vi.mocked((Enquirer as any).Select).mockImplementation(function (
        this: any
      ) {
        promptInstance = this;
        this.cancel = vi.fn();
        this.run = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
        this.close = vi.fn();

        return this;
      } as any);

      select({
        message: 'Test message',
        choices: [{ name: 'C1', value: 'v1' }],
      });

      // Initially no exit
      expect(exitSpy).not.toHaveBeenCalled();

      // Trigger cancel -> initially swallowed because age < 200ms
      promptInstance.cancel();

      // Wait more than ESC_GUARD_MS (200ms)
      vi.advanceTimersByTime(201);

      // Now cancel should actually trigger exit
      promptInstance.cancel();

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Goodbye'));
      expect(exitSpy).toHaveBeenCalledWith(0);
      expect(promptInstance.close).toHaveBeenCalled();
    });

    it('should swallow phantom cancel within guard time', async () => {
      let promptInstance: any;
      vi.mocked((Enquirer as any).Select).mockImplementation(function (
        this: any
      ) {
        promptInstance = this;
        this.run = vi.fn().mockImplementation(() => new Promise(() => {}));
        return this;
      } as any);

      select({
        message: 'Test message',
        choices: [{ name: 'C1', value: 'v1' }],
      });

      // Trigger cancel immediately (phantom)
      promptInstance.cancel();
      expect(exitSpy).not.toHaveBeenCalled();

      // Trigger cancel again after guard time
      vi.advanceTimersByTime(201);
      promptInstance.cancel();
      expect(exitSpy).toHaveBeenCalledWith(0);

      // Trigger cancel again (should return because already cancelled)
      exitSpy.mockClear();
      promptInstance.cancel();
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe('input', () => {
    it('should run input prompt and return result', async () => {
      vi.mocked((Enquirer as any).Input).mockImplementation(function (
        this: any
      ) {
        this.run = vi.fn().mockResolvedValue('Input value');
        return this;
      } as any);

      const result = await input({
        message: 'Test message',
      });

      expect(result).toBe('Input value');
      expect((Enquirer as any).Input).toHaveBeenCalled();
    });

    it('should handle escape in input', async () => {
      let promptInstance: any;
      vi.mocked((Enquirer as any).Input).mockImplementation(function (
        this: any
      ) {
        promptInstance = this;
        this.run = vi.fn().mockImplementation(() => new Promise(() => {}));
        return this;
      } as any);

      input({ message: 'Test message' });

      vi.advanceTimersByTime(201);
      promptInstance.cancel(); // Should trigger exit after guard time

      expect(exitSpy).toHaveBeenCalledWith(0);
    });
  });
});
