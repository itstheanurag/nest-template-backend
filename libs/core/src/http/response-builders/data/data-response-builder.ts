import { I18nContext } from '../../types';

/**
 * This class deals with http sucesss responses
 *
 * @category Core
 * @subcategory Response
 */
export class DataResponseBuilder {
  private data: any;
  private message: string;
  private metadata: Record<string, any>;
  private i18nContext: I18nContext;

  getData(): any {
    return this.data;
  }

  setData(data: any): void {
    this.data = data;
  }

  getMessage(): string {
    return this.message;
  }

  setMessage(message: string): void {
    this.message = message;
  }

  getI18nContext(): I18nContext {
    return this.i18nContext;
  }

  setI18nContext(i18n: any, args?: Record<string, any>): this {
    this.i18nContext = {
      provider: i18n,
      args: args,
    };
    return this;
  }

  getMetadata(): Record<string, any> {
    return this.metadata;
  }

  setMetadata(data: Record<string, any>): this {
    this.metadata = data;
    return this;
  }

  dataResponseSkeleton(): any {
    return {
      data: this.getData(),
      message: this.getMessage(),
      meta: this.getMetadata(),
    };
  }

  send(data: any = null, message: string): any {
    this.setData(data);
    this.setMessage(
      this.getI18nContext()
        ? this.getI18nContext().provider.t(message, {
            args: this.getI18nContext().args,
          })
        : message,
    );
    return this.dataResponseSkeleton();
  }

  sendWithMeta(data: any = null, message: string = null, meta = {}): any {
    this.setMetadata(meta);
    return this.send(data, message);
  }
}
