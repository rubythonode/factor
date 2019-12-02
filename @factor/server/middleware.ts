import { applyFilters, pushToFilter } from "@factor/tools/filters"
import { getPath } from "@factor/tools/paths"
import { setting } from "@factor/tools/settings"
import bodyParser from "body-parser"
import compression from "compression"
import helmet from "helmet"
import serveFavicon from "serve-favicon"
import { Application, Request, Response, NextFunction } from "express"
import { serveStatic } from "./util"
import logger from "./logger"

export interface MiddlewareHandler {
  (request: Request, response: Response, next: NextFunction): void;
}

export interface MiddlewarePathConfig {
  path: string;
  middleware: MiddlewareHandler[];
}

export function addMiddleware({ path = "/", middleware = [] }): void {
  pushToFilter("middleware", { path, middleware })
}

export function loadMiddleware(app: Application, middleware = []): void {
  const fav = setting("app.faviconPath")

  if (fav) app.use(serveFavicon(fav))

  // Serve distribution folder at Root URL
  app.use("/", serveStatic(getPath("dist"), true))

  app.use(logger())
  app.use(compression())
  app.use(helmet())

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())

  middleware.forEach(_ => app.use(_))

  const ware = applyFilters("middleware", [])

  if (ware.length > 0) {
    ware.forEach(({ path = "/", middleware }: MiddlewarePathConfig) => {
      app.use(path, ...middleware)
    })
  }
}