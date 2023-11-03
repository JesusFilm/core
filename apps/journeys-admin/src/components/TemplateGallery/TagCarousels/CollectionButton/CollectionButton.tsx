import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { GetTags_tags as Tag } from '../../../../../__generated__/GetTags'
import jesusFilmImage from '../assets/jesusFilm.png'
import nuaImage from '../assets/nua.png'

type ChildTag = Tag & { parentId: string }

interface CollectionButtonProps {
  tag: ChildTag
  onChange: (value: string) => void
}

const StyledCollectionButton = styled(ButtonBase)(() => ({
  borderRadius: '8px'
}))

export function CollectionButton({
  tag,
  onChange
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

  const tagLabel: string = tag.name[0]?.value ?? ''
  const image = tagImage(tagLabel)
  return (
    <StyledCollectionButton onClick={() => onChange(tag.id)}>
      <Stack
        gap={3}
        alignItems="center"
        sx={{ [theme.breakpoints.up('md')]: { flexDirection: 'row' } }}
      >
        <Box
          sx={{
            position: 'relative',
            backgroundColor: 'grey',
            height: '64px',
            width: '64px',
            color: 'white',
            borderRadius: 8
          }}
        >
          {image != null && (
            <NextImage src={image.src} layout="fill" sx={{ borderRadius: 8 }} />
          )}
        </Box>
        <Typography
          variant="subtitle2"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          {tag.name[0].value}
        </Typography>
        <Typography
          variant="subtitle3"
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {tag.name[0].value}
        </Typography>
      </Stack>
    </StyledCollectionButton>
  )
}
