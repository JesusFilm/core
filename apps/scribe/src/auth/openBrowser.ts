import { spawn } from 'node:child_process'
import { platform } from 'node:os'

export function openBrowser(url: string): void {
  const command =
    platform() === 'darwin'
      ? 'open'
      : platform() === 'win32'
        ? 'start'
        : 'xdg-open'

  const args = platform() === 'win32' ? ['', url] : [url]

  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
    shell: platform() === 'win32'
  })
  child.unref()
}
