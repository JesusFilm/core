export const getSubtitleR2Path = (video, edition, languageId, file) => {
  const extension = file.name.split('.').pop()

  return `${video.id}/editions/${edition.id}/subtitles/${video.id}_${edition.id}_${languageId}.${extension}`
}
