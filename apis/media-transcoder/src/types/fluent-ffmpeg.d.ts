import ffmpeg from 'fluent-ffmpeg'

declare module 'fluent-ffmpeg' {
  interface FfmpegCommand {
    on(
      event: 'progress',
      callback: (progress: { percent: number }) => void
    ): FfmpegCommand
    on(event: 'end', callback: () => void): FfmpegCommand
    on(event: 'error', callback: (err: Error) => void): FfmpegCommand
  }
}

export default ffmpeg
