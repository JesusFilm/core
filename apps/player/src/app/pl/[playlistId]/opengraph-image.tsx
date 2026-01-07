import { ImageResponse } from 'next/og'

import { getPlaylist } from './getPlaylist'

import { env } from '@/env'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const Logo = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7F5F1'
      }}
    >
      <img
        src={`${env.VERCEL_URL ? `https://${env.VERCEL_URL}` : 'http://localhost:4700'}/images/logo-sign.svg`}
        style={{ width: '294px', height: '216px' }}
      />
    </div>
  )
}

export default async function Image({
  params
}: {
  params: Promise<{ playlistId: string }>
}) {
  const { playlistId } = await params
  const data = await getPlaylist(playlistId)

  if (
    !data?.playlist ||
    'message' in data.playlist ||
    data.playlist.__typename !== 'QueryPlaylistSuccess'
  ) {
    return new ImageResponse(<Logo />, {
      width: size.width,
      height: size.height
    })
  }

  const images = data.playlist.data.items.flatMap((item) => {
    const imageVariants = item.videoVariant?.video?.images ?? []
    return imageVariants
      .map((image) => image?.mobileCinematicHigh)
      .filter(
        (image): image is string =>
          typeof image === 'string' && image.trim().length > 0
      )
  })

  if (images.length === 0) {
    return new ImageResponse(<Logo />, {
      width: size.width,
      height: size.height
    })
  }

  const MAX_CELLS = 4
  const hiddenCount = Math.max(images.length - MAX_CELLS, 0)
  const showHiddenCount = hiddenCount > 0
  const visibleImages = showHiddenCount
    ? images.slice(0, MAX_CELLS - 1)
    : images.slice(0, MAX_CELLS)
  const cells = Array.from(
    { length: images.length <= 2 ? images.length : MAX_CELLS },
    (_, index) => visibleImages[index] ?? null
  )

  return new ImageResponse(
    cells.length === 1 ? (
      <img
        src={cells[0]!}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    ) : (
      <div
        style={{
          display: 'flex',
          flexWrap: cells.length > 2 ? 'wrap' : 'nowrap',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#F7F5F1'
        }}
      >
        {cells.map((image, index) => {
          const isHiddenCell = showHiddenCount && index === MAX_CELLS - 1
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                width: '50%',
                height: '50%'
              }}
            >
              {isHiddenCell && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    color: 'white',
                    fontSize: 96,
                    fontWeight: 700
                  }}
                >
                  +{hiddenCount}
                </div>
              )}
              {!isHiddenCell && image && (
                <img
                  src={image}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}
              {!isHiddenCell && image == null && <Logo />}
            </div>
          )
        })}
      </div>
    ),
    { width: size.width, height: size.height }
  )
}
