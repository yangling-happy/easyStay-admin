export const logger = {
  info: (message: string, payload?: unknown) => {
    if (payload === undefined) {
      console.log(`[INFO] ${message}`);
      return;
    }
    console.log(`[INFO] ${message}`, payload);
  },

  warn: (message: string, payload?: unknown) => {
    if (payload === undefined) {
      console.warn(`[WARN] ${message}`);
      return;
    }
    console.warn(`[WARN] ${message}`, payload);
  },

  error: (message: string, payload?: unknown) => {
    if (payload === undefined) {
      console.error(`[ERROR] ${message}`);
      return;
    }
    console.error(`[ERROR] ${message}`, payload);
  },

  debug: (message: string, payload?: unknown) => {
    if (process.env.NODE_ENV === "production") return;
    if (payload === undefined) {
      console.log(`[DEBUG] ${message}`);
      return;
    }
    console.log(`[DEBUG] ${message}`, payload);
  },
};
