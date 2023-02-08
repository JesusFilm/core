import { ReactElement } from 'react'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { SearchUnsplashPhotos_searchUnsplashPhotos_results } from '../../../../../../__generated__/SearchUnsplashPhotos'
import { ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos } from '../../../../../../__generated__/ListUnsplashCollectionPhotos'

interface UnsplashListProps {
  gallery: Array<
    | ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos
    | SearchUnsplashPhotos_searchUnsplashPhotos_results
    | null
  >
}

export function UnsplashList({ gallery }: UnsplashListProps): ReactElement {
  return (
    <ImageList variant="masonry">
      {gallery?.map((item) => (
        <ImageListItem key={item?.id} sx={{ pb: 1 }}>
          <Stack spacing={1}>
            <Image
              src={item?.urls?.small ?? ''}
              alt={item?.alt_description ?? ''}
              width={item?.width ?? ''}
              height={item?.height ?? ''}
              style={{
                borderRadius: 8
              }}
            />
            <Link
              href={`https://unsplash.com/@${
                item?.user?.username ?? ''
              }?utm_source=your_app_name&utm_medium=referral`}
              color="secondary.light"
            >
              <Typography variant="caption">
                {item?.user?.first_name} {item?.user?.last_name}
              </Typography>
            </Link>
          </Stack>
        </ImageListItem>
      ))}
    </ImageList>
  )
}
