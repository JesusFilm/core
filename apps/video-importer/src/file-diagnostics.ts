import { exec } from 'child_process'
import { constants, createReadStream, statSync } from 'fs'
import { access } from 'fs/promises'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface FileDiagnostics {
  filePath: string
  exists: boolean
  readable: boolean
  size: number
  permissions: string
  owner: string
  group: string
  diskSpace: {
    available: number
    total: number
    used: number
  }
  fileSystem: string
  mountPoint: string
  inode: number
  lastModified: Date
  lastAccessed: Date
  lastChanged: Date
  isDirectory: boolean
  isFile: boolean
  isSymbolicLink: boolean
  canRead: boolean
  canWrite: boolean
  canExecute: boolean
}

export async function diagnoseFile(filePath: string): Promise<FileDiagnostics> {
  const diagnostics: Partial<FileDiagnostics> = {
    filePath
  }

  try {
    // Basic file existence and permissions
    const stats = statSync(filePath)
    diagnostics.exists = true
    diagnostics.size = stats.size
    diagnostics.lastModified = stats.mtime
    diagnostics.lastAccessed = stats.atime
    diagnostics.lastChanged = stats.ctime
    diagnostics.isDirectory = stats.isDirectory()
    diagnostics.isFile = stats.isFile()
    diagnostics.isSymbolicLink = stats.isSymbolicLink()
    diagnostics.inode = stats.ino

    // Check read permissions
    try {
      await access(filePath, constants.R_OK)
      diagnostics.readable = true
      diagnostics.canRead = true
    } catch {
      diagnostics.readable = false
      diagnostics.canRead = false
    }

    // Check write permissions
    try {
      await access(filePath, constants.W_OK)
      diagnostics.canWrite = true
    } catch {
      diagnostics.canWrite = false
    }

    // Check execute permissions
    try {
      await access(filePath, constants.X_OK)
      diagnostics.canExecute = true
    } catch {
      diagnostics.canExecute = false
    }

    // Get file permissions in octal format
    diagnostics.permissions = (stats.mode & 0o777).toString(8)

    // Get disk space information
    try {
      const { stdout } = await execAsync(`df -h "${filePath}" | tail -1`)
      const parts = stdout.trim().split(/\s+/)
      if (parts.length >= 4) {
        diagnostics.diskSpace = {
          available: parseInt(parts[3].replace(/[^\d]/g, ''), 10),
          total: parseInt(parts[1].replace(/[^\d]/g, ''), 10),
          used: parseInt(parts[2].replace(/[^\d]/g, ''), 10)
        }
        diagnostics.fileSystem = parts[0]
        diagnostics.mountPoint = parts[5]
      }
    } catch (error) {
      console.warn('Could not get disk space info:', error)
    }

    // Get file owner and group
    try {
      const { stdout } = await execAsync(`ls -l "${filePath}"`)
      const parts = stdout.trim().split(/\s+/)
      if (parts.length >= 3) {
        diagnostics.owner = parts[2]
        diagnostics.group = parts[3]
      }
    } catch (error) {
      console.warn('Could not get file owner info:', error)
    }
  } catch (error) {
    diagnostics.exists = false
    diagnostics.readable = false
    console.error(
      `File ${filePath} does not exist or is not accessible:`,
      error
    )
  }

  return diagnostics as FileDiagnostics
}

export async function testFileRead(filePath: string): Promise<{
  success: boolean
  error?: string
  bytesRead: number
  duration: number
}> {
  const startTime = Date.now()
  let bytesRead = 0
  let success = false
  let error: string | undefined

  try {
    return new Promise((resolve) => {
      const stream = createReadStream(filePath, { highWaterMark: 64 * 1024 })

      stream.on('data', (chunk) => {
        bytesRead += chunk.length
      })

      stream.on('end', () => {
        const duration = Date.now() - startTime
        success = true
        resolve({ success, bytesRead, duration })
      })

      stream.on('error', (err) => {
        const duration = Date.now() - startTime
        error = err.message
        resolve({ success: false, error, bytesRead, duration })
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        const duration = Date.now() - startTime
        resolve({
          success: false,
          error: 'Read test timed out',
          bytesRead,
          duration
        })
      }, 30000)
    })
  } catch (err) {
    const duration = Date.now() - startTime
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      bytesRead,
      duration
    }
  }
}

export function printDiagnostics(diagnostics: FileDiagnostics): void {
  console.log('\n=== File Diagnostics ===')
  console.log(`File: ${diagnostics.filePath}`)
  console.log(`Exists: ${diagnostics.exists}`)
  console.log(`Readable: ${diagnostics.readable}`)
  console.log(
    `Size: ${diagnostics.size} bytes (${(diagnostics.size / 1024 / 1024).toFixed(2)} MB)`
  )
  console.log(`Permissions: ${diagnostics.permissions}`)
  console.log(`Owner: ${diagnostics.owner}`)
  console.log(`Group: ${diagnostics.group}`)
  console.log(
    `Type: ${diagnostics.isFile ? 'File' : diagnostics.isDirectory ? 'Directory' : 'Other'}`
  )
  console.log(`Can Read: ${diagnostics.canRead}`)
  console.log(`Can Write: ${diagnostics.canWrite}`)
  console.log(`Can Execute: ${diagnostics.canExecute}`)
  console.log(`Last Modified: ${diagnostics.lastModified.toISOString()}`)
  console.log(`Inode: ${diagnostics.inode}`)

  if (diagnostics.diskSpace) {
    console.log(`\nDisk Space:`)
    console.log(`  Available: ${diagnostics.diskSpace.available} MB`)
    console.log(`  Total: ${diagnostics.diskSpace.total} MB`)
    console.log(`  Used: ${diagnostics.diskSpace.used} MB`)
    console.log(`  File System: ${diagnostics.fileSystem}`)
    console.log(`  Mount Point: ${diagnostics.mountPoint}`)
  }
}
