export function isSingleExecutableApplication(): boolean {
  try {
    const sea = require('node:sea') as { isSea?: () => boolean }

    return sea.isSea?.() === true
  } catch {
    return false
  }
}

export function getPackagedAppDir(): string | undefined {
  const configuredAppDir = process.env.VIDEO_IMPORTER_APP_DIR

  if (configuredAppDir != null && configuredAppDir.trim().length > 0) {
    return configuredAppDir
  }

  if (isSingleExecutableApplication()) {
    return require('path').dirname(process.execPath)
  }

  return undefined
}
