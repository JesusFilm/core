export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    const blobUrl = URL.createObjectURL(file)

    video.src = blobUrl

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(blobUrl)
      resolve(video.duration)
    }

    video.onerror = () => {
      URL.revokeObjectURL(blobUrl)
      reject(new Error('Metadata load failed'))
    }
  })
}
