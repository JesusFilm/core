import ButtonBase from '@mui/material/ButtonBase'
import CircularProgress from '@mui/material/CircularProgress'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import { ReactElement } from 'react'

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
}

export function MediaLibraryList({
  images,
  selectedSrc,
  handleSelect,
  uploading
}: MediaLibraryListProps): ReactElement {
  return (
    <ImageList
      gap={10}
      sx={{ overflowY: 'visible' }}
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
                objectFit: 'cover',
              }}
            />
          </ButtonBase>
        </ImageListItem>
      ))}
    </ImageList>
  )
}
