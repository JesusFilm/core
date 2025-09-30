export const getImageUrl = (
  imageId: string | undefined,
  type: string
): string => {
  if (!imageId) {
    return ''
  }
  const baseUrl = `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'}/${imageId}`

  switch (type) {
    case 'thumbnail':
      return `${baseUrl}/f=jpg,w=120,h=68,q=95`
    case 'videoStill':
      return `${baseUrl}/f=jpg,w=1920,h=1080,q=95`
    case 'mobileCinematicHigh':
      return `${baseUrl}/f=jpg,w=1280,h=600,q=95`
    case 'mobileCinematicLow':
      return `${baseUrl}/f=jpg,w=640,h=300,q=95`
    case 'mobileCinematicVeryLow':
      return `${baseUrl}/f=webp,w=640,h=300,q=50`
    default:
      return ''
  }
}
