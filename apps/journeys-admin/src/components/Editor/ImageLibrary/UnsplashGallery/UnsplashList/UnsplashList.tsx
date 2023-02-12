import { ReactElement } from 'react'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import ButtonBase from '@mui/material/ButtonBase'
import { ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos } from '../../../../../../__generated__/ListUnsplashCollectionPhotos'
import { SearchUnsplashPhotos_searchUnsplashPhotos_results } from '../../../../../../__generated__/SearchUnsplashPhotos'

interface UnsplashListProps {
  gallery: Array<
    | ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos
    | SearchUnsplashPhotos_searchUnsplashPhotos_results
  >
  onChange: (src: string) => void
}

export function UnsplashList({
  gallery,
  onChange
}: UnsplashListProps): ReactElement {
  return (
    <ImageList variant="masonry">
      {gallery?.map((item) => (
        <ImageListItem key={item?.id} sx={{ pb: 1 }}>
          <Stack spacing={1}>
            <ButtonBase onClick={() => onChange(item.urls.regular)}>
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
            <Link
              href={`https://unsplash.com/@${item.user.username ?? ''
                }?utm_source=your_app_name&utm_medium=referral`}
              color="secondary.light"
            >
              <Typography variant="caption">{item.user.first_name}</Typography>
            </Link>
          </Stack>
        </ImageListItem>
      ))
      }
    </ImageList >
  )
}
