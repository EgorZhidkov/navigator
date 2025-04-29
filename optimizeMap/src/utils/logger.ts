import chalk from 'chalk';

class Logger {
  private truncateLength = 100;
  private separator = chalk.gray('─'.repeat(80));

  /**
   * Получает путь к файлу из стека вызовов
   * @returns путь к файлу или 'unknown'
   */
  private getCallerFile(): string {
    try {
      const err = new Error();
      const stack = err.stack?.split('\n');
      if (!stack) return 'unknown';

      // Ищем третий элемент стека (после Error и метода логгера)
      const callerLine = stack[3];
      if (!callerLine) return 'unknown';

      // Извлекаем путь к файлу из строки стека
      const match = callerLine.match(/at .+ \((.+)\)/);
      if (!match) return 'unknown';

      const filePath = match[1];
      // Извлекаем только имя файла из полного пути
      const fileName = filePath.split('/').pop() || filePath;
      return fileName;
    } catch {
      return 'unknown';
    }
  }

  formatResponse(data: any): string {
    const stringified = JSON.stringify(data);
    if (stringified.length > this.truncateLength) {
      return stringified.substring(0, this.truncateLength) + '...';
    }
    return stringified;
  }

  private printSeparator() {
    console.log(this.separator);
  }

  info(message: string, data?: any) {
    this.printSeparator();
    const timestamp = new Date().toISOString();
    const file = this.getCallerFile();
    console.log(
      chalk.blue(`[${timestamp}] INFO [${file}]: ${message}`),
      data ? `\nData: ${this.formatResponse(data)}` : ''
    );
  }

  error(message: string, error?: any) {
    this.printSeparator();
    const timestamp = new Date().toISOString();
    const file = this.getCallerFile();
    console.error(
      chalk.red(`[${timestamp}] ERROR [${file}]: ${message}`),
      error ? `\nError: ${error}` : ''
    );
  }

  request(method: string, url: string, body?: any) {
    this.printSeparator();
    const timestamp = new Date().toISOString();
    const file = this.getCallerFile();
    console.log(
      chalk.green(`[${timestamp}] REQUEST [${file}] ${method} ${url}`),
      body ? `\nBody: ${this.formatResponse(body)}` : ''
    );
  }

  response(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    data?: any
  ) {
    this.printSeparator();
    const timestamp = new Date().toISOString();
    const file = this.getCallerFile();
    console.log(
      chalk.yellow(
        `[${timestamp}] RESPONSE [${file}] ${method} ${url} - Status: ${statusCode} - Time: ${responseTime}ms`
      ),
      data ? `\nResponse: ${this.formatResponse(data)}` : ''
    );
  }
}

export const logger = new Logger();
