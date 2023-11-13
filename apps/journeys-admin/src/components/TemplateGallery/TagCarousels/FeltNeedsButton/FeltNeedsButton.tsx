import ButtonBase from '@mui/material/ButtonBase'
import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { GetTags_tags as Tag } from '../../../../../__generated__/GetTags'
import acceptanceImage from '../assets/acceptance.png'
import depressionImage from '../assets/depression.png'
import fearAnxietyImage from '../assets/fearAnxiety.png'
import forgivenessImage from '../assets/forgiveness.png'
import hopeImage from '../assets/hope.png'
import lonelinessImage from '../assets/loneliness.png'
import loveImage from '../assets/love.png'
import securityImage from '../assets/security.png'
import significanceImage from '../assets/significance.png'

type ChildTag = Tag & { parentId: string }

const StyledFeltNeedsButton = styled(ButtonBase)(() => ({
  backgroundColor: 'grey',
  padding: '32px 28px',
  color: 'white',
  borderRadius: '8px'
}))

interface FeltNeedsButtonProps {
  item?: ChildTag
  onClick: (value: string) => void
}

export function FeltNeedsButton({
  item: tag,
  onClick
}: FeltNeedsButtonProps): ReactElement {
  const tagImage = useCallback((tagLabel: string) => {
    switch (tagLabel) {
      case 'Acceptance':
        return acceptanceImage
      case 'Depression':
        return depressionImage
      case 'Fear/Anxiety':
        return fearAnxietyImage
      case 'Forgiveness':
        return forgivenessImage
      case 'Hope':
        return hopeImage
      case 'Loneliness':
        return lonelinessImage
      case 'Love':
        return loveImage
      case 'Security':
        return securityImage
      case 'Significance':
        return significanceImage
      default:
        return undefined
    }
  }, [])

  const tagLabel = tag?.name[0]?.value ?? ''
  const image = tagImage(tagLabel)

  return tag != null ? (
    image != null ? (
      <StyledFeltNeedsButton
        key={`${tagLabel}-button}`}
        sx={{
          width: { xs: '150px', md: '222px' },
          height: { xs: '56px', md: '110px' },
          overflow: 'hidden',
          '&:hover': {
            '& .hoverStyles': {
              transform: 'scale(1.02)'
            }
          },
          '& .hoverStyles': {
            transition: (theme) => theme.transitions.create('transform')
          }
        }}
        onClick={() => onClick(tag.id)}
      >
        <NextImage
          className="hoverStyles"
          src={image.src}
          layout="fill"
          sx={{ borderRadius: 2 }}
        />
        <Typography
          className="hoverStyles"
          variant="h3"
          sx={{
            zIndex: 1,
            display: { xs: 'none', md: 'flex' },
            position: 'absolute',
            opacity: '60%',
            left: 12,
            bottom: 8
          }}
        >
          {tagLabel}
        </Typography>
        <Typography
          className="hoverStyles"
          variant="subtitle2"
          sx={{
            zIndex: 1,
            display: { md: 'none' },
            position: 'absolute',
            opacity: '60%',
            left: 8,
            bottom: 4
          }}
        >
          {tagLabel}
        </Typography>
      </StyledFeltNeedsButton>
    ) : (
      // Hack to return something since must return element with renderProps
      <></>
    )
  ) : (
    <Skeleton
      data-testid="felt-needs-button-loading"
      variant="rounded"
      sx={{
        width: { xs: '150px', md: '222px' },
        height: { xs: '56px', md: '110px' },
        borderRadius: 2
      }}
    />
  )
}
