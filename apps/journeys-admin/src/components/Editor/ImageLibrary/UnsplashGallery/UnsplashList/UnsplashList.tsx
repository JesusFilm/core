import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import { ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos } from '../../../../../../__generated__/ListUnsplashCollectionPhotos'
import { SearchUnsplashPhotos_searchUnsplashPhotos_results } from '../../../../../../__generated__/SearchUnsplashPhotos'

interface UnsplashListProps {
  gallery: Array<
    | ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos
    | SearchUnsplashPhotos_searchUnsplashPhotos_results
  >
  onChange: (src: string, author: string) => void
}

export function UnsplashList({
  gallery,
  onChange
}: UnsplashListProps): ReactElement {
  const [currentIndex, setCurrentIndex] = useState<number | null>()
  return (
    <ImageList variant="masonry" gap={10}>
      {gallery?.map((item, index) => (
        <ImageListItem key={item?.id}>
          <ButtonBase
            onClick={() =>
              onChange(item.urls.regular, `${item.user.first_name} last name`)
            }
            onMouseEnter={() => setCurrentIndex(index)}
            onMouseLeave={() => setCurrentIndex(null)}
            sx={{ position: 'relative' }}
          >
            <Image
              src={item.urls.small}
              alt="tests"
              width={item.width}
              height={item.height}
              style={{
                borderRadius: 8
              }}
            />
          </ButtonBase>
          {currentIndex === index && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                padding: 1,
                borderRadius: '0 0 8px 8px'
              }}
            >
              <Typography variant="caption" color="background.default">
                {item.user.first_name} last name
              </Typography>
            </Box>
          )}
        </ImageListItem>
      ))}
    </ImageList>
  )
}
