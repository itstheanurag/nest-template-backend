/**
 * Interface for server options
 * @category Core
 */
export interface ServerOptions {
  port?: number; // Default: 3000
  host?: string; // Default: 'localhost'
  enableVersioning?: boolean; // Default: false, enables api versioning with prefix 'v' (e.g., /v1/)
  enableApiDocumentation?: boolean; // Default: false, enables Swagger API documentation at /api-docs
  enableServerLogs?: boolean; // Default: false
  /** Maximum time (ms) to wait for in-flight requests during shutdown. Default: 10000 */
  shutdownTimeoutMs?: number; // Default: 10000, maximum time (ms) to wait for in-flight requests during shutdown
}
