export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[restaurants-app] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[restaurants-app] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[restaurants-app] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    console.debug(`[restaurants-app] ${message}`, ...args);
  },
};
