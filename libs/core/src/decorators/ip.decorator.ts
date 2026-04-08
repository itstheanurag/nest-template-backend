import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Get the complete IP address information including all forwarded IPs
 */
export interface IpAddressInfo {
  ip: string;
  forwards: string[];
}

/**
 * Extract the client IP address from the request
 * Handles proxied requests by checking common proxy headers
 */
export const GetIpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();

    // Check for common proxy headers (in order of preference)
    const forwardedFor = request.headers['x-forwarded-for'];
    const realIp = request.headers['x-real-ip'];
    const connectionRemoteAddress = request.connection?.remoteAddress;
    const socketRemoteAddress = request.socket?.remoteAddress;

    // X-Forwarded-For can contain multiple IPs, take the first one
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor
        : forwardedFor.split(',').map((ip: string) => ip.trim());
      return ips[0];
    }

    // X-Real-IP (used by Nginx proxy)
    if (realIp) {
      return realIp;
    }

    // Direct connection remote address
    if (connectionRemoteAddress) {
      return connectionRemoteAddress;
    }

    // Socket remote address
    if (socketRemoteAddress) {
      return socketRemoteAddress;
    }

    // Fallback to remote address from request
    return request.ip;
  },
);

export const GetIpAddressInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IpAddressInfo => {
    const request = ctx.switchToHttp().getRequest();

    const forwardedFor = request.headers['x-forwarded-for'];
    const forwards = forwardedFor
      ? Array.isArray(forwardedFor)
        ? forwardedFor
        : forwardedFor.split(',').map((ip: string) => ip.trim())
      : [];

    // Extract the first IP from forwarded headers
    let ip = '';
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor
        : forwardedFor.split(',').map((ip: string) => ip.trim());
      ip = ips[0];
    } else if (request.headers['x-real-ip']) {
      ip = request.headers['x-real-ip'];
    } else if (request.connection?.remoteAddress) {
      ip = request.connection.remoteAddress;
    } else if (request.socket?.remoteAddress) {
      ip = request.socket.remoteAddress;
    } else {
      ip = request.ip || '';
    }

    return {
      ip,
      forwards,
    };
  },
);
