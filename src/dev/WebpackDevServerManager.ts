import BluebirdPromise from "bluebird-lst"
import { blue, red } from "chalk"
import { ChildProcess, spawn } from "child_process"
import * as path from "path"
import { getCommonEnv, LineFilter, logError, logProcess, logProcessErrorOutput, onDeath } from "./DevRunnerUtil"

const debug = require("debug")("electron-webpack:dev-runner")

function spawnWds(projectDir: string) {
  const webpackDevServerPath = path.join(projectDir, "node_modules", ".bin", "webpack-dev-server" + (process.platform === "win32" ? ".cmd" : ""))
  debug(`Start webpack-dev-server ${webpackDevServerPath}`)
  return spawn(webpackDevServerPath, ["--color", "--config", path.join(__dirname, "../../webpack.renderer.config.js")], {
    env: getCommonEnv(),
  })
}

// 1. in another process to speedup compilation
// 2. some loaders detect webpack-dev-server hot mode only if run as CLI
export function startRenderer(projectDir: string) {
  const lineFilter = new CompoundRendererLineFilter([
    new OneTimeLineFilter("Project is running at "),
    new OneTimeLineFilter("webpack output is served from "),
  ])
  return new BluebirdPromise((resolve: (() => void) | null, reject: ((error: Error) => void) | null) => {
    let webpackDevServer: ChildProcess | null
    try {
      webpackDevServer = spawnWds(projectDir)
    }
    catch (e) {
      reject!(e)
      return
    }

    onDeath(eventName => {
      if (webpackDevServer == null) {
        return
      }

      if (debug.enabled) {
        debug(`Kill webpackDevServer on ${eventName}`)
      }
      webpackDevServer.kill("SIGINT")
      webpackDevServer = null
    })

    webpackDevServer.on("error", error => {
      if (reject == null) {
        logError("Renderer", error)
      }
      else {
        reject(error)
        reject = null
      }
    })

    webpackDevServer.stdout.on("data", (data: string) => {
      logProcess("Renderer", data, blue, lineFilter)

      const r = resolve
      // we must resolve only after compilation, otherwise devtools disconnected
      if (r != null && data.includes("webpack: Compiled successfully.")) {
        resolve = null
        r()
      }
    })

    logProcessErrorOutput("Renderer", webpackDevServer)

    webpackDevServer.on("close", code => {
      webpackDevServer = null

      const message = `webpackDevServer process exited with code ${code}`

      if (resolve != null) {
        resolve = null
      }
      if (reject != null) {
        reject(new Error(message))
        reject = null
      }

      if (code === 0) {
        if (debug.enabled) {
          debug(message)
          // otherwise no newline in the terminal
          process.stderr.write("\n")
        }
      }
      else {
        logProcess("Renderer", message, red)
      }
    })
  })
}

class OneTimeLineFilter implements LineFilter {
  private filtered = false

  constructor(private readonly prefix: string) {
  }

  filter(line: string) {
    if (!this.filtered && line.startsWith(this.prefix)) {
      this.filtered = true
      return false

    }
    return true
  }
}

class CompoundRendererLineFilter implements LineFilter {
  constructor(private readonly filters: Array<LineFilter>) {
  }

  filter(line: string) {
    return !this.filters.some(it => !it.filter(line))
  }
}