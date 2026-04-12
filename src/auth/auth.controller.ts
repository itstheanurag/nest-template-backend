import { All, Controller, Req, Res } from '@nestjs/common';

import { AuthService } from './service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @All()
  async handleRoot(@Req() request: any, @Res() reply: any) {
    return this.handle(request, reply);
  }

  @All('*')
  async handleAll(@Req() request: any, @Res() reply: any) {
    return this.handle(request, reply);
  }

  private async handle(request: any, reply: any) {
    const authRequest = this.toWebRequest(request);
    const response = await this.authService.instance.handler(authRequest);

    reply.status(response.status);

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') {
        reply.header(key, value);
      }
    });

    const setCookies =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : [];

    for (const cookie of setCookies) {
      reply.raw.appendHeader('set-cookie', cookie);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return reply.send(buffer);
  }

  private toWebRequest(request: any): Request {
    const protocol =
      request.protocol ?? request.headers['x-forwarded-proto'] ?? 'http';
    const host = request.headers.host;
    const url = new URL(request.url, `${protocol}://${host}`);

    const headers = new Headers();
    Object.entries(request.headers).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => headers.append(key, item));
        return;
      }

      headers.set(key, String(value));
    });

    const method = request.method?.toUpperCase() ?? 'GET';
    const body = ['GET', 'HEAD'].includes(method)
      ? undefined
      : this.normalizeBody(request.body, headers);

    return new Request(url, {
      method,
      headers,
      body,
    });
  }

  private normalizeBody(body: unknown, headers: Headers): BodyInit | undefined {
    if (body == null) {
      return undefined;
    }

    if (typeof body === 'string') {
      return body;
    }

    if (body instanceof Buffer) {
      return body.toString('utf8');
    }

    if (body instanceof Uint8Array) {
      return Buffer.from(body).toString('utf8');
    }

    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    return JSON.stringify(body);
  }
}
