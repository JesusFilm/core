import fs from 'fs'
import path from 'path'

import dotenv from 'dotenv'

import { getPackagedAppDir } from './runtime'

function getEnvFilePath(): string {
  const packagedAppDir = getPackagedAppDir()

  const candidateDirs = [
    packagedAppDir,
    path.resolve(process.cwd(), 'apps/video-importer'),
    process.cwd()
  ].filter((dir): dir is string => dir != null && dir.trim().length > 0)

  for (const dir of candidateDirs) {
    const envPath = path.join(dir, '.env')
    if (fs.existsSync(envPath)) return envPath
  }

  return path.join(candidateDirs[0] ?? process.cwd(), '.env')
}

dotenv.config({ path: getEnvFilePath() })
