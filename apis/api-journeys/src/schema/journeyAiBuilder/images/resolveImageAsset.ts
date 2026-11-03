import sharp from 'sharp'

/** Public image CDNs used by the editor. Do not fetch arbitrary model URLs. */
const IMAGE_HOSTS = new Set([
  'imagedelivery.net',
  'images.unsplash.com',
  'image.mux.com',
  'imagizer.imageshack.com',
  'd1wl257kev7hsz.cloudfront.net',
  'i.ytimg.com'
])

export async function resolveImageAsset(
  src: string,
  signal: AbortSignal
): Promise<{ width: number; height: number; blurhash: string }> {
  const url = new URL(src)
  if (
    url.protocol !== 'https:' ||
    !IMAGE_HOSTS.has(url.hostname) ||
    url.username !== '' ||
    url.password !== ''
  )
    throw new Error(
      'Choose an image uploaded through the editor or an image from its supported libraries.'
    )
  const response = await fetch(url, {
    redirect: 'error',
    signal: AbortSignal.any([signal, AbortSignal.timeout(10000)])
  })
  if (!response.ok) throw new Error('The selected image is unavailable.')
  if (Number(response.headers.get('content-length') ?? 0) > 10000000)
    throw new Error('The selected image is too large.')
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length > 10000000)
    throw new Error('The selected image is too large.')
  const metadata = await sharp(bytes, { limitInputPixels: 40000000 }).metadata()
  if (metadata.width == null || metadata.height == null)
    throw new Error('Could not read the selected image dimensions.')
  return { width: metadata.width, height: metadata.height, blurhash: '' }
}
