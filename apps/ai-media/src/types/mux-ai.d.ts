declare module '@mux/ai/primitives' {
  export type SubtitleCue = {
    start: number
    end: number
    text: string
  }

  export type SubtitleFile = {
    language: string
    format: 'vtt' | 'srt'
    cues: SubtitleCue[]
  }

  export type MuxAssetReference = {
    assetId: string
    playbackId: string
  }

  export type GenerateSubtitlesInput = {
    asset: MuxAssetReference
    language: string
    format: SubtitleFile['format']
  }

  export type ImproveSubtitlesInput = {
    subtitles: SubtitleFile
    instructions: string
    model: string
  }

  export type UploadSubtitlesInput = {
    asset: MuxAssetReference
    subtitles: SubtitleFile
  }

  export type UploadSubtitlesResult = {
    subtitleId: string
    url: string
  }

  export function generateSubtitles(
    input: GenerateSubtitlesInput
  ): Promise<SubtitleFile>

  export function improveSubtitles(
    input: ImproveSubtitlesInput
  ): Promise<SubtitleFile>

  export function uploadSubtitles(
    input: UploadSubtitlesInput
  ): Promise<UploadSubtitlesResult>
}
