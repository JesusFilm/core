/* eslint-disable */
// This is a mock implementation of fluent-ffmpeg for testing
export interface FfmpegCommand {
  input(url: string): FfmpegCommand
  size(size: string): FfmpegCommand
  autopad(): FfmpegCommand
  videoBitrate(bitrate: string): FfmpegCommand
  saveToFile(outputFile: string): FfmpegCommand
  on(
    event: 'progress',
    callback: (progress: { percent: number }) => void
  ): FfmpegCommand
  on(event: 'end', callback: () => void): FfmpegCommand
  on(event: 'error', callback: (err: Error) => void): FfmpegCommand
  on(event: string, callback: any): FfmpegCommand
}

// Default export function that creates a new FfmpegCommand
export default function ffmpeg(): FfmpegCommand {
  // This is just a stub - the actual implementation will be mocked in tests
  const command: FfmpegCommand = {
    input: (url: string) => command,
    size: (size: string) => command,
    autopad: () => command,
    videoBitrate: (bitrate: string) => command,
    saveToFile: (outputFile: string) => command,
    on: (event: any, callback: any) => command
  }
  return command
}
