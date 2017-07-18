import { ChalkChain, red } from "chalk"
import { ChildProcess } from "child_process"

function joinLines(s: string) {
  const lines = s
    .trim()
    .split(/\r?\n/)
    .filter(it => {
      // https://github.com/electron/electron/issues/4420
      // this warning can be safely ignored
      if (it.includes("Couldn't set selectedTextBackgroundColor from default ()")) {
        return false
      }
      return !it.includes("Warning: This is an experimental feature and could change at any time.")
        && !it.includes("No type errors found")
        && !it.includes("webpack: Compiled successfully.")
    })

  if (lines.length === 0) {
    return ""
  }
  return "  " + lines.join(`\n  `) + "\n"
}

export function logProcessErrorOutput(label: "Electron" | "Renderer" | "Main", childProcess: ChildProcess) {
  childProcess.stderr.on("data", data => {
    logProcess(label, data.toString(), red)
  })
}

export function logError(label: "Electron" | "Renderer" | "Main", error: Error) {
  logProcess(label, error.stack || error.toString(), red)
}

export function logProcess(label: "Electron" | "Renderer" | "Main", data: string | Buffer, color: ChalkChain) {
  const log = joinLines(data.toString())
  if (log.length > 0 && /[0-9A-z]+/.test(log)) {
    process.stdout.write(
      color.bold(`┏ ${label} -------------------`) +
      "\n\n" + log + "\n" +
      color.bold("┗ ----------------------------") +
      "\n\n"
    )
  }
}