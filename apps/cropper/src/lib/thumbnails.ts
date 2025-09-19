export async function captureThumbnail(
  video: HTMLVideoElement,
  time: number,
  quality = 0.8
): Promise<string | null> {
  if (typeof document === 'undefined') {
    return null
  }

  if (!video.videoWidth || !video.videoHeight) {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const context = canvas.getContext('2d')

  if (!context) {
    return null
  }

  const previousTime = video.currentTime

  await new Promise<void>((resolve) => {
    const handleSeeked = () => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      resolve()
    }

    video.addEventListener('seeked', handleSeeked, { once: true })
    video.currentTime = Math.min(time, video.duration)
  })

  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  video.currentTime = previousTime

  return dataUrl
}
