export function getVideoUrl(videoId: string, languageId?: string): string {
  if (!videoId) {
    return '/watch'
  }

  // For course videos, use the proper URL structure
  if (videoId.startsWith('nbc-')) {
    // Extract episode number and title from videoId
    const episodeMatch = videoId.match(/nbc-(\d+)/)
    if (episodeMatch) {
      const episodeNum = episodeMatch[1]
      const episodeTitle = getEpisodeTitle(episodeNum)
      const lang = languageId || 'english'
      return `/watch/new-believer-course/${episodeNum}-${episodeTitle}/${lang}`
    }
  }

  // For other videos, use the standard structure
  const lang = languageId || 'english'
  return `/watch/video/${videoId}/${lang}`
}

function getEpisodeTitle(episodeNum: string): string {
  const titles: Record<string, string> = {
    '01': 'the-simple-gospel',
    '02': 'the-blood-of-jesus',
    '03': 'life-after-death',
    '04': 'gods-forgiveness',
    '05': 'savior-lord-and-friend',
    '06': 'being-made-new',
    '07': 'living-for-god',
    '08': 'the-bible',
    '09': 'prayer',
    '10': 'church'
  }
  return titles[episodeNum] || 'episode'
}

export function getCourseUrl(courseId: string): string {
  return `/watch/course/${courseId}`
}
