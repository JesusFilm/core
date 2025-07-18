import { gql, useMutation } from '@apollo/client'
import ButtonBase from '@mui/material/ButtonBase'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import Link from '@mui/material/Link'
import { ReactElement } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../__generated__/globalTypes'
import { ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos as UnsplashCollectionPhotos } from '../../../../../../../../../__generated__/ListUnsplashCollectionPhotos'
import { SearchUnsplashPhotos_searchUnsplashPhotos_results as UnsplashSearchPhotos } from '../../../../../../../../../__generated__/SearchUnsplashPhotos'
import {
  TriggerUnsplashDownload,
  TriggerUnsplashDownloadVariables
} from '../../../../../../../../../__generated__/TriggerUnsplashDownload'

export const TRIGGER_UNSPLASH_DOWNLOAD = gql`
  mutation TriggerUnsplashDownload($url: String!) {
    triggerUnsplashDownload(url: $url)
  }
`

interface UnsplashListProps {
  selectedBlock?: ImageBlock | null
  gallery: Array<UnsplashCollectionPhotos | UnsplashSearchPhotos>
  onChange: (input: ImageBlockUpdateInput) => void
}

export function UnsplashList({
  selectedBlock,
  gallery,
  onChange
}: UnsplashListProps): ReactElement {
  const [triggerUnsplashDownload] = useMutation<
    TriggerUnsplashDownload,
    TriggerUnsplashDownloadVariables
  >(TRIGGER_UNSPLASH_DOWNLOAD)

  const handleClick = (
    item: UnsplashCollectionPhotos | UnsplashSearchPhotos
  ): void => {
    void triggerUnsplashDownload({
      variables: { url: item.links.download_location },
      context: { skipQueue: true }
    })
    onChange({
      src: item.urls.regular,
      blurhash: item.blur_hash,
      width: 1080,
      height: Math.ceil((item.height / item.width) * 1080),
      alt: item.alt_description,
      scale: 100,
      focalLeft: 50,
      focalTop: 50
    })
  }

  return (
    <ImageList
      gap={10}
      sx={{ overflowY: 'visible' }}
      data-testid="UnsplashList"
    >
      {gallery.map((item) => (
        <ImageListItem
          data-testid={`image-${item.id}`}
          key={item.id}
          sx={{
            background: (theme) => theme.palette.divider,
            outline: '2px solid',
            transition: (theme) => theme.transitions.create('outline-color'),
            outlineColor: (theme) =>
              selectedBlock?.src === item.urls.regular
                ? theme.palette.primary.main
                : 'transparent',
            borderRadius: 2,
            outlineOffset: 2,
            cursor: 'pointer',
            overflow: 'hidden',
            '& .MuiImageListItemBar-root': {
              transition: (theme) => theme.transitions.create('opacity'),
              opacity: 0
            },
            '&:hover .MuiImageListItemBar-root': {
              opacity: 1
            }
          }}
        >
          <ButtonBase onClick={() => handleClick(item)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              srcSet={`${item.urls.raw}&w=134&h=134&fit=crop&auto=format&dpr=2 2x`}
              src={`${item.urls.raw}&w=134&h=134&fit=crop&auto=format`}
              alt={item.alt_description ?? ''}
              style={{
                aspectRatio: '1/1',
                opacity: 0,
                transition: 'opacity 0.5s'
              }}
              onLoad={(event) => {
                event.currentTarget.style.opacity = '1'
              }}
            />
          </ButtonBase>
          <ImageListItemBar
            sx={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
            }}
            title={
              <Link
                href={`https://unsplash.com/@${item.user.username}?utm_source=nextstep.is&utm_medium=referral`}
                target="_blank"
                rel="noreferrer"
                variant="caption"
                fontWeight="bold"
                color="primary.contrastText"
              >
                {item.user.first_name} {item.user.last_name}
              </Link>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  )
}
