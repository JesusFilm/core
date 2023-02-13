import { ReactElement } from 'react'
import ButtonBase from '@mui/material/ButtonBase'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Image from 'next/image'
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
  return (
    <ImageList variant="masonry" gap={10}>
      {gallery?.map((item, index) => (
        <ImageListItem key={item?.id}>
          <ButtonBase
            onClick={() =>
              onChange(item.urls.regular, `${item.user.first_name} last name`)
            }
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
        </ImageListItem>
      ))}
    </ImageList>
  )
}
