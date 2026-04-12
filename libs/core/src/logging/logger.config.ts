import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Params } from 'nestjs-pino';

type HeaderValue = string | string[] | undefined;

interface TraceContext {
  traceId: string;
  spanId?: string;
}

const REQUEST_ID_HEADERS = ['x-request-id', 'x-correlation-id'] as const;
const TRACE_ID_HEADERS = ['x-trace-id', 'trace-id', 'x-b3-traceid'] as const;
const SPAN_ID_HEADERS = ['x-span-id', 'span-id', 'x-b3-spanid'] as const;

function readHeader(headers: Record<string, HeaderValue>, name: string) {
  const value = headers[name];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function setResponseHeader(res: any, name: string, value: string) {
  if (typeof res?.header === 'function') {
    res.header(name, value);
    return;
  }

  if (typeof res?.setHeader === 'function') {
    res.setHeader(name, value);
  }
}

function resolveRequestId(req: any, res: any) {
  const headers = (req?.headers ?? {}) as Record<string, HeaderValue>;

  const incomingRequestId = REQUEST_ID_HEADERS.map((headerName) =>
    readHeader(headers, headerName),
  ).find(Boolean);

  const requestId = incomingRequestId ?? req.id ?? randomUUID();
  req.id = requestId;

  setResponseHeader(res, 'x-request-id', requestId);

  return requestId;
}

function resolveTraceContext(
  headers: Record<string, HeaderValue>,
  requestId: string,
): TraceContext {
  const traceparent = readHeader(headers, 'traceparent');

  if (traceparent) {
    const [, traceId, spanId] = traceparent.split('-');

    if (traceId) {
      return { traceId, spanId };
    }
  }

  const traceId =
    TRACE_ID_HEADERS.map((headerName) => readHeader(headers, headerName)).find(
      Boolean,
    ) ?? requestId;

  const spanId = SPAN_ID_HEADERS.map((headerName) =>
    readHeader(headers, headerName),
  ).find(Boolean);

  return { traceId, spanId };
}

export function createLoggerConfig(configService: ConfigService): Params {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const serviceName =
    process.env.npm_package_name ??
    configService.get<string>('APP_NAME') ??
    'nest-template';
  const level =
    configService.get<string>('LOG_LEVEL') ?? (isProduction ? 'info' : 'debug');

  return {
    pinoHttp: {
      level,
      messageKey: 'message',
      customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error',
        responseTime: 'durationMs',
      },
      formatters: {
        level(label) {
          return {
            level: label,
            severity: label.toUpperCase(),
          };
        },
      },
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      base: {
        service: serviceName,
        env: configService.get<string>('NODE_ENV') ?? 'development',
      },
      genReqId(req, res) {
        return resolveRequestId(req, res);
      },
      customLogLevel(_req, res, err) {
        if (err || res.statusCode >= 500) {
          return 'error';
        }

        if (res.statusCode >= 400) {
          return 'warn';
        }

        return 'info';
      },
      customReceivedMessage: () => 'request received',
      customSuccessMessage: () => 'request completed',
      customErrorMessage: () => 'request failed',
      customProps(req, res) {
        const headers = (req?.headers ?? {}) as Record<string, HeaderValue>;
        const requestId = req.id ?? resolveRequestId(req, res);
        const { traceId, spanId } = resolveTraceContext(headers, requestId);

        return {
          requestId,
          traceId,
          spanId,
          correlationId: readHeader(headers, 'x-correlation-id') ?? requestId,
        };
      },
      serializers: {
        request(req) {
          return {
            id: req.id,
            method: req.method,
            url: req.url,
            routePath: req.routeOptions?.url,
            path: req.routerPath,
            hostname: req.hostname,
            remoteAddress: req.ip ?? req.socket?.remoteAddress,
            remotePort: req.socket?.remotePort,
            headers: req.headers,
          };
        },
        response(res) {
          return {
            statusCode: res.statusCode,
            headers:
              typeof res.getHeaders === 'function' ? res.getHeaders() : {},
          };
        },
        error(err) {
          return {
            type: err.name,
            message: err.message,
            stack: err.stack,
            code: err.code,
            statusCode: err.statusCode ?? err.status,
          };
        },
      },
      redact: {
        paths: [
          'request.headers.authorization',
          'request.headers.cookie',
          'request.headers["set-cookie"]',
          'request.headers["x-api-key"]',
          'response.headers["set-cookie"]',
          'error.config.headers.Authorization',
        ],
        censor: '[Redacted]',
      },
    },
  };
}
