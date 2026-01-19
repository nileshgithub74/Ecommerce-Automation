export class Logger {
  private static instance: Logger;
  private logs: string[] = [];

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}`;
    
    if (data) {
      console.log(logMessage, data);
      this.logs.push(`${logMessage} ${JSON.stringify(data)}`);
    } else {
      console.log(logMessage);
      this.logs.push(logMessage);
    }
  }

  error(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;
    
    if (error) {
      console.error(logMessage, error);
      this.logs.push(`${logMessage} ${JSON.stringify(error)}`);
    } else {
      console.error(logMessage);
      this.logs.push(logMessage);
    }
  }

  warn(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] WARN: ${message}`;
    
    if (data) {
      console.warn(logMessage, data);
      this.logs.push(`${logMessage} ${JSON.stringify(data)}`);
    } else {
      console.warn(logMessage);
      this.logs.push(logMessage);
    }
  }

  debug(message: string, data?: any): void {
    if (process.env.DEBUG === 'true') {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] DEBUG: ${message}`;
      
      if (data) {
        console.debug(logMessage, data);
        this.logs.push(`${logMessage} ${JSON.stringify(data)}`);
      } else {
        console.debug(logMessage);
        this.logs.push(logMessage);
      }
    }
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}