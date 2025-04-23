export const getSubtitleR2Path = (
  videoId: string,
  editionId: string,
  languageId: string,
  file: File
) => {
  const extension = file.name.split('.').pop()

  return `${videoId}/editions/${editionId}/subtitles/${videoId}_${editionId}_${languageId}.${extension}`
}
