import ButtonBase from '@mui/material/ButtonBase'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Image from 'next/legacy/image'
import { ReactElement, useState } from 'react'

import { ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos as UnsplashCollectionPhotos } from '../../../../../../__generated__/ListUnsplashCollectionPhotos'
import { SearchUnsplashPhotos_searchUnsplashPhotos_results as UnsplashSearchPhotos } from '../../../../../../__generated__/SearchUnsplashPhotos'
import type { UnsplashAuthor } from '../UnsplashGallery'

interface UnsplashListProps {
  gallery: Array<UnsplashCollectionPhotos | UnsplashSearchPhotos>
  onChange: (
    src: string,
    unsplashAuthor: UnsplashAuthor,
    download_location: string,
    blurhash?: string,
    width?: number,
    height?: number
  ) => void
}

export function UnsplashList({
  gallery,
  onChange
}: UnsplashListProps): ReactElement {
  const [selectedItem, setSelectedItem] = useState<
    UnsplashCollectionPhotos | UnsplashSearchPhotos
  >()

  const handleClick = (
    item: UnsplashCollectionPhotos | UnsplashSearchPhotos,
    url: string,
    unsplashAuthor: UnsplashAuthor
  ): void => {
    onChange(
      url,
      unsplashAuthor,
      item.links.download_location,
      item.blur_hash,
      item.width,
      item.height
    )
    setSelectedItem(item)
  }

  return (
    <ImageList variant="masonry" gap={10} sx={{ overflowY: 'visible' }}>
      {gallery?.map((item) => (
        <ImageListItem
          data-testid={`image-${item.id}`}
          key={item?.id}
          sx={{
            border: selectedItem === item ? '2px solid #C52D3A' : 'none',
            borderRadius: 2,
            padding: 0.5
          }}
        >
          <ButtonBase
            onClick={() =>
              handleClick(item, item.urls.regular, {
                fullname: `${(item.user.first_name as string) ?? ''} ${
                  (item.user.last_name as string) ?? ''
                }`,
                username: `${item.user.username}`
              })
            }
            sx={{ position: 'relative' }}
          >
            <Image
              src={item.urls.small}
              alt={item.alt_description ?? ''}
              width={item.width}
              height={item.height}
              style={{
                borderRadius: 8,
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </ButtonBase>
        </ImageListItem>
      ))}
    </ImageList>
  )
}
