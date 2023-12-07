import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import ButtonBase from '@mui/material/ButtonBase'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { GetTags_tags as Tag } from '../../../../../__generated__/GetTags'

import jesusFilmImage from './assets/jesusFilm.jpg'
import nuaImage from './assets/nua.jpg'

type ChildTag = Tag & { parentId: string }

interface CollectionButtonProps {
  item?: ChildTag
  onClick: (value: string) => void
}

const StyledCollectionButton = styled(ButtonBase)(({ theme }) => ({
  borderRadius: '8px',
  transition: theme.transitions.create('background-color'),
  '& .backgroundImageHover': {
    transition: theme.transitions.create('transform')
  },
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
    '& .backgroundImageHover': {
      transform: 'scale(1.05)'
    }
  }
}))

export function CollectionButton({
  item: tag,
  onClick
}: CollectionButtonProps): ReactElement {
  const theme = useTheme()

  const tagImage = useCallback((tagLabel: string) => {
    switch (tagLabel) {
      case 'Jesus Film':
        return jesusFilmImage
      case 'NUA':
        return nuaImage
      default:
        return undefined
    }
  }, [])

  const tagLabel = tag?.name[0]?.value ?? ''
  const image = tagImage(tagLabel)

  return (
    <StyledCollectionButton
      disableRipple
      disableTouchRipple
      onClick={() => {
        if (tag != null) onClick(tag.id)
      }}
      sx={{
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: (theme) => theme.palette.primary.main,
          outlineOffset: '2px'
        }
      }}
    >
      <Stack
        gap={3}
        alignItems="center"
        sx={{
          [theme.breakpoints.up('md')]: { flexDirection: 'row' },
          p: 2
        }}
      >
        {tag != null ? (
          <Stack
            justifyContent="center"
            alignItems="center"
            sx={{
              position: 'relative',
              backgroundColor: 'grey',
              height: '64px',
              width: '64px',
              color: 'white',
              borderRadius: 8,
              overflow: 'hidden'
            }}
          >
            {image != null ? (
              <NextImage
                rel="preload"
                className="backgroundImageHover"
                src={image.src}
                layout="fill"
                sx={{ borderRadius: 8 }}
                sizes="128px"
              />
            ) : (
              <InsertPhotoRoundedIcon className="backgroundImageHover" />
            )}
          </Stack>
        ) : (
          <Skeleton
            data-testid="collections-button-loading"
            variant="rounded"
            sx={{ height: '64px', width: '64px', borderRadius: 8 }}
          />
        )}
        <Typography
          variant="subtitle2"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          {tag != null ? tagLabel : <Skeleton width={80} />}
        </Typography>
        <Typography
          variant="subtitle3"
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {tag != null ? tagLabel : <Skeleton width={80} />}
        </Typography>
      </Stack>
    </StyledCollectionButton>
  )
}
