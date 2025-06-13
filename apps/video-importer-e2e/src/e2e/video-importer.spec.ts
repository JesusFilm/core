import { execFile } from 'child_process'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { promisify } from 'util'

import { expect, test } from '@playwright/test'

const execFileAsync = promisify(execFile)

const projectRoot = resolve(__dirname, '../../../../')
const videoImporterScriptPath = join(
  projectRoot,
  'apps/video-importer/src/video-importer.ts'
)

test.describe('Video Importer E2E', () => {
  let tempTestDir: string

  test.beforeEach(async () => {
    tempTestDir = await mkdtemp(join(tmpdir(), 'video-importer-e2e-'))
  })

  test.afterEach(async () => {
    if (tempTestDir) {
      await rm(tempTestDir, { recursive: true, force: true })
    }
  })

  test('should process a valid video file in dry run mode', async () => {
    const videoFileName = '123---testEdition---videoABC.mp4'
    const dummyVideoPath = join(tempTestDir, videoFileName)
    await writeFile(dummyVideoPath, 'dummy video content')

    const command = 'npx'
    const args = [
      'ts-node',
      videoImporterScriptPath,
      '--folder',
      tempTestDir,
      '--dry-run'
    ]

    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd: projectRoot
    })

    expect(stderr).toBe('')
    expect(stdout).toContain(`🎬 Processing: ${videoFileName}`)
    expect(stdout).toContain(`[DRY RUN] Would process file: ${videoFileName}`)
    expect(stdout).toContain('Total files: 1')
    expect(stdout).toContain('Successfully processed: 0')
    expect(stdout).toContain('Failed: 0')
  })

  test('should report error for non-existent folder', async () => {
    const nonExistentFolder = join(tempTestDir, 'non_existent_folder')
    const command = 'npx'
    const args = [
      'ts-node',
      videoImporterScriptPath,
      '--folder',
      nonExistentFolder
    ]

    const result = await execFileAsync(command, args, {
      cwd: projectRoot
    }).catch((e) => e)

    expect(result).toHaveProperty('code')

    const errorResult = result as import('child_process').ExecException & {
      code?: number
    }
    expect(errorResult.code).not.toBe(0)

    expect(errorResult.stderr).toContain(
      `Failed to read folder: ${nonExistentFolder}`
    )
  })

  test('should skip file with invalid filename format', async () => {
    const invalidFileName = 'invalid_video_file.mp4'
    const dummyInvalidVideoPath = join(tempTestDir, invalidFileName)
    await writeFile(dummyInvalidVideoPath, 'dummy content')

    const command = 'npx'
    const args = ['ts-node', videoImporterScriptPath, '--folder', tempTestDir]
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd: projectRoot
    })

    expect(stderr).toBe('')
    expect(stdout.trim()).toBe('No valid video files found in the folder.')
  })
})
