import ButtonBase from '@mui/material/ButtonBase'
import CircularProgress from '@mui/material/CircularProgress'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import { ReactElement, useEffect, useRef } from 'react'

export interface MediaLibraryListImage {
  id: string
  src: string
  blurhash: string | null
}

interface MediaLibraryListProps {
  images: MediaLibraryListImage[]
  selectedSrc?: string | null
  handleSelect: (image: MediaLibraryListImage) => void
  uploading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  loadingMore?: boolean
}

const MOBILE_TILE_SIZE = 120

export function MediaLibraryList({
  images,
  selectedSrc,
  handleSelect,
  uploading,
  hasMore = false,
  onLoadMore,
  loadingMore = false
}: MediaLibraryListProps): ReactElement {
  const sentinelRef = useRef<HTMLLIElement | null>(null)
  const scrollerRef = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    if (!hasMore || onLoadMore == null) return
    if (typeof IntersectionObserver === 'undefined') return
    const node = sentinelRef.current
    if (node == null) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore()
        }
      },
      { root: scrollerRef.current, rootMargin: '0px 200px 0px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore, images.length])

  return (
    <>
      <ImageList
        ref={scrollerRef}
        gap={10}
        rowHeight={MOBILE_TILE_SIZE}
        data-testid="MediaLibraryListMobile"
        sx={{
          display: { xs: 'flex', sm: 'none' },
          flexWrap: 'nowrap',
          py: 1,
         '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none' 
        }}
      >
        {uploading === true && (
          <ImageListItem
            data-testid="media-library-image-uploading-mobile"
            sx={{
              flex: `0 0 ${MOBILE_TILE_SIZE}px`,
              borderRadius: 2,
              background: (theme) => theme.palette.divider,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={24} />
          </ImageListItem>
        )}
        {images.map((img) => (
          <ImageListItem
            key={img.id}
            sx={{
              flex: `0 0 ${MOBILE_TILE_SIZE}px`,
              borderRadius: 2,
              background: (theme) => theme.palette.divider,
              outline: '2px solid',
              outlineOffset: 2,
              transition: (theme) => theme.transitions.create('outline-color'),
              outlineColor: (theme) =>
                selectedSrc === img.src
                  ? theme.palette.primary.main
                  : 'transparent',
              overflow: 'hidden',
            }}
          >
            <ButtonBase
              data-testid={`media-library-image-${img.id}-mobile`}
              onClick={() => handleSelect(img)}
              disableRipple
              sx={{ width: '100%', height: '100%', borderRadius: 2 }}
            >
              <img
                src={img.src}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </ButtonBase>
          </ImageListItem>
        ))}
        {hasMore && (
          <ImageListItem
            ref={sentinelRef}
            data-testid="media-library-load-more-sentinel"
            sx={{
              flex: `0 0 ${MOBILE_TILE_SIZE}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {loadingMore && <CircularProgress size={24} />}
          </ImageListItem>
        )}
      </ImageList>

      <ImageList
        gap={10}
        sx={{ display: { xs: 'none', sm: 'grid' }, overflowY: 'visible' }}
        data-testid="MediaLibraryList"
      >
        {uploading === true && (
          <ImageListItem
            data-testid="media-library-image-uploading"
            sx={{
              aspectRatio: '1 / 1',
              borderRadius: 2,
              background: (theme) => theme.palette.divider,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress size={24} />
          </ImageListItem>
        )}
        {images.map((img) => (
          <ImageListItem
            key={img.id}
            sx={{
              aspectRatio: '1 / 1',
              borderRadius: 2,
              background: (theme) => theme.palette.divider,
              outline: '2px solid',
              outlineOffset: 2,
              transition: (theme) => theme.transitions.create('outline-color'),
              outlineColor: (theme) =>
                selectedSrc === img.src
                  ? theme.palette.primary.main
                  : 'transparent'
            }}
          >
            <ButtonBase
              data-testid={`media-library-image-${img.id}`}
              onClick={() => handleSelect(img)}
              disableRipple
              sx={{ width: '100%', height: '100%' }}
            >
              <img
                src={img.src}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </ButtonBase>
          </ImageListItem>
        ))}
      </ImageList>
    </>
  )
}
