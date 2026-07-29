import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: Error & { status?: number; statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isDev    = process.env.NODE_ENV !== 'production'
  const status   = err.status || err.statusCode || 500
  const message  = status < 500
    ? err.message                           // client errors: safe to expose
    : isDev
      ? err.message                         // dev: show everything
      : 'Internal server error'             // prod: never leak internals

  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`)
  }

  res.status(status).json({
    message,
    ...(isDev && status >= 500 && { stack: err.stack }),
  })
}
