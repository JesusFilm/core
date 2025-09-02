declare module 'fluent-ffmpeg' {
  interface FfmpegCommand {
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

  function ffmpeg(): FfmpegCommand
  export = ffmpeg
}
