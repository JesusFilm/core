import { exec } from 'child_process'
import { constants, createReadStream, statSync } from 'fs'
import { access } from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface FileDiagnostics {
  filePath: string
  exists: boolean
  readable: boolean
  size: number
  permissions: string
  lastModified: Date
  isDirectory: boolean
  isFile: boolean
  canRead: boolean
  canWrite: boolean
  // Windows-specific checks
  pathLength: number
  hasInvalidChars: boolean
  isReservedName: boolean
  possibleFileLock: boolean
  // Cross-platform disk info
  diskSpace?: {
    available: string
    total: string
    free: string
  }
}

// Windows reserved names
const WINDOWS_RESERVED_NAMES = [
  'CON',
  'PRN',
  'AUX',
  'NUL',
  'COM1',
  'COM2',
  'COM3',
  'COM4',
  'COM5',
  'COM6',
  'COM7',
  'COM8',
  'COM9',
  'LPT1',
  'LPT2',
  'LPT3',
  'LPT4',
  'LPT5',
  'LPT6',
  'LPT7',
  'LPT8',
  'LPT9'
]

export async function testFileRead(filePath: string): Promise<void> {
  const startTime = Date.now()
  let bytesRead = 0

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, {
      highWaterMark: 1024 * 1024 // 1MB chunks for better performance
    })

    const cleanup = () => {
      if (!stream.destroyed) {
        stream.destroy()
      }
    }

    const timeout = setTimeout(() => {
      cleanup()
      const duration = Date.now() - startTime
      console.error(
        `   Read test details: ${bytesRead} bytes read in ${duration}ms`
      )
      reject(new Error('Read test timed out after 30 seconds'))
    }, 30000)

    stream.on('data', (chunk) => {
      bytesRead += chunk.length
    })

    stream.on('end', () => {
      clearTimeout(timeout)
      const duration = Date.now() - startTime
      console.log(
        `   File read test passed: ${bytesRead} bytes read in ${duration}ms`
      )
      resolve()
    })

    stream.on('error', (err) => {
      clearTimeout(timeout)
      cleanup()
      const duration = Date.now() - startTime
      console.error(
        `   Read test details: ${bytesRead} bytes read in ${duration}ms`
      )
      reject(new Error(`File read test failed: ${err.message}`))
    })
  })
}

async function getDiskSpace(
  filePath: string
): Promise<FileDiagnostics['diskSpace']> {
  try {
    if (os.platform() === 'win32') {
      // Windows: Use wmic
      const drive = path.parse(filePath).root
      const { stdout } = await execAsync(
        `wmic logicaldisk where "DeviceID='${drive.replace('\\', '')}'" get size,freespace /format:csv`
      )
      const lines = stdout.split('\n').filter((line) => line.includes(','))
      if (lines.length > 0) {
        const parts = lines[0].split(',')
        const freeSpace = parseInt(parts[1]) || 0
        const totalSpace = parseInt(parts[2]) || 0
        return {
          free: `${Math.round(freeSpace / 1024 / 1024 / 1024)} GB`,
          total: `${Math.round(totalSpace / 1024 / 1024 / 1024)} GB`,
          available: `${Math.round(freeSpace / 1024 / 1024 / 1024)} GB`
        }
      }
    } else {
      // Unix/Linux/macOS
      const { stdout } = await execAsync(`df -h "${filePath}" | tail -1`)
      const parts = stdout.trim().split(/\s+/)
      if (parts.length >= 4) {
        return {
          total: parts[1],
          available: parts[3],
          free: parts[3]
        }
      }
    }
  } catch (error) {
    console.warn('Could not get disk space info:', error)
  }
  return undefined
}

function checkWindowsSpecificIssues(filePath: string): {
  pathLength: number
  hasInvalidChars: boolean
  isReservedName: boolean
} {
  const pathLength = filePath.length
  const fileName = path.basename(filePath, path.extname(filePath)).toUpperCase()

  // Windows invalid characters: < > : " | ? * and control characters
  const invalidCharsRegex = /[<>:"|?*]/
  const hasInvalidChars =
    invalidCharsRegex.test(filePath) ||
    Array.from(filePath).some((char) => char.charCodeAt(0) < 32)

  const isReservedName = WINDOWS_RESERVED_NAMES.includes(fileName)

  return { pathLength, hasInvalidChars, isReservedName }
}

export async function diagnoseFile(filePath: string): Promise<FileDiagnostics> {
  const diagnostics: Partial<FileDiagnostics> = { filePath }

  // Windows-specific checks
  const windowsChecks = checkWindowsSpecificIssues(filePath)
  diagnostics.pathLength = windowsChecks.pathLength
  diagnostics.hasInvalidChars = windowsChecks.hasInvalidChars
  diagnostics.isReservedName = windowsChecks.isReservedName

  try {
    const stats = statSync(filePath)
    diagnostics.exists = true
    diagnostics.size = stats.size
    diagnostics.lastModified = stats.mtime
    diagnostics.isDirectory = stats.isDirectory()
    diagnostics.isFile = stats.isFile()

    // Cross-platform permission checks
    try {
      await access(filePath, constants.R_OK)
      diagnostics.canRead = true
      diagnostics.readable = true
    } catch {
      diagnostics.canRead = false
      diagnostics.readable = false
    }

    try {
      await access(filePath, constants.W_OK)
      diagnostics.canWrite = true
    } catch {
      diagnostics.canWrite = false
    }

    // Simple permission representation
    diagnostics.permissions =
      os.platform() === 'win32'
        ? `R:${diagnostics.canRead} W:${diagnostics.canWrite}`
        : (stats.mode & 0o777).toString(8)

    // Check for possible file lock (Windows-specific issue)
    if (os.platform() === 'win32' && diagnostics.canRead) {
      try {
        // Try to open file exclusively to detect locks
        const testStream = createReadStream(filePath, {
          flags: 'r',
          highWaterMark: 1
        })
        await new Promise((resolve, reject) => {
          testStream.on('open', () => {
            testStream.close()
            resolve(void 0)
          })
          testStream.on('error', reject)
          setTimeout(() => reject(new Error('timeout')), 1000)
        })
        diagnostics.possibleFileLock = false
      } catch {
        diagnostics.possibleFileLock = true
      }
    } else {
      diagnostics.possibleFileLock = false
    }

    // Get disk space
    diagnostics.diskSpace = await getDiskSpace(filePath)
  } catch (error) {
    diagnostics.exists = false
    diagnostics.readable = false
    diagnostics.canRead = false
    diagnostics.canWrite = false
    diagnostics.possibleFileLock = false
  }

  return diagnostics as FileDiagnostics
}

export function printDiagnostics(diagnostics: FileDiagnostics): void {
  console.log('\n=== File Diagnostics ===')
  console.log(`File: ${diagnostics.filePath}`)
  console.log(`Exists: ${diagnostics.exists}`)
  console.log(`Readable: ${diagnostics.readable}`)
  console.log(
    `Size: ${diagnostics.size.toLocaleString()} bytes (${(diagnostics.size / 1024 / 1024).toFixed(2)} MB)`
  )
  console.log(`Permissions: ${diagnostics.permissions}`)
  console.log(`Can Read: ${diagnostics.canRead}`)
  console.log(`Can Write: ${diagnostics.canWrite}`)
  console.log(`Last Modified: ${diagnostics.lastModified.toISOString()}`)

  // Windows-specific diagnostics
  if (os.platform() === 'win32') {
    console.log('\n--- Windows-Specific Checks ---')
    console.log(
      `Path Length: ${diagnostics.pathLength} characters ${diagnostics.pathLength > 260 ? '⚠️  (May be too long)' : '✅'}`
    )
    console.log(
      `Invalid Characters: ${diagnostics.hasInvalidChars ? '❌ Yes' : '✅ No'}`
    )
    console.log(
      `Reserved Name: ${diagnostics.isReservedName ? '❌ Yes' : '✅ No'}`
    )
    console.log(
      `Possible File Lock: ${diagnostics.possibleFileLock ? '⚠️  Yes' : '✅ No'}`
    )
  }

  if (diagnostics.diskSpace) {
    console.log('\n--- Disk Space ---')
    console.log(`Available: ${diagnostics.diskSpace.available}`)
    console.log(`Total: ${diagnostics.diskSpace.total}`)
  }
}
