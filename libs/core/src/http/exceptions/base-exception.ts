/**
 * This class is used to throw BaseExceptions
 *
 * @category Core
 * @subcategory Exception
 */
export class BaseException extends Error {
  message: string;
  name: string;
  statusCode: number;
  errorCode: number;
  data: Record<string, any>;

  constructor(message: string) {
    super(message);
    this.message = message;
  }

  getException(): BaseException {
    return this;
  }

  getMessage(): string {
    return this.message;
  }

  setMessage(message: string): BaseException {
    this.message = message;
    return this;
  }

  getData(): Record<string, any> {
    return this.data;
  }

  setData(data): this {
    this.data = data;
    return this;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): BaseException {
    this.name = name;
    return this;
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  setStatusCode(statusCode: number): BaseException {
    this.statusCode = statusCode;
    return this;
  }

  getErrorCode(): number {
    return this.errorCode;
  }

  setErrorCode(errorCode: number): BaseException {
    this.errorCode = errorCode;
    return this;
  }

  getStack(): string {
    return this.stack || '';
  }
}
