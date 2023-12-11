import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import ButtonBase from '@mui/material/ButtonBase'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import NextImage, { StaticImageData } from 'next/image'
import { ReactElement } from 'react'

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

function tagImage(tagLabel?: string): StaticImageData | undefined {
  switch (tagLabel) {
    case 'NUA':
      return nuaImage
    case 'Jesus Film':
      return jesusFilmImage
  }
}

export function CollectionButton({
  item: tag,
  onClick
}: CollectionButtonProps): ReactElement {
  const theme = useTheme()

  const tagLabel = tag?.name[0]?.value
  const image = tagImage(tagLabel)

  return (
    <StyledCollectionButton
      disableRipple
      disableTouchRipple
      onClick={() => tag != null && onClick(tag.id)}
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
                priority
                className="backgroundImageHover"
                src={image.src}
                layout="fill"
                alt={tagLabel ?? 'CollectionImage'}
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
          {tagLabel ?? <Skeleton width={80} />}
        </Typography>
        <Typography
          variant="subtitle3"
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {tagLabel ?? <Skeleton width={80} />}
        </Typography>
      </Stack>
    </StyledCollectionButton>
  )
}
