export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: unknown): void;
}

export class ConsoleLogger implements Logger {
  info(message: string): void {
    console.log(message);
  }

  warn(message: string): void {
    console.warn(message);
  }

  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      console.error(`${message}: ${error.message}`);
      return;
    }
    console.error(message);
  }
}
