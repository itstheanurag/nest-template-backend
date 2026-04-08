export class DataResponseSkeleton<T> {
  readonly message: string;
  readonly data: T;
  readonly meta?: Record<string, any>;
}
