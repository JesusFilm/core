import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import NextImage, { StaticImageData } from 'next/image'
import { ReactElement } from 'react'

import { GetTags_tags as Tag } from '../../../../../__generated__/GetTags'

import acceptanceImage from './assets/acceptance.jpg'
import depressionImage from './assets/depression.jpg'
import fearAnxietyImage from './assets/fearAnxiety.jpg'
import forgivenessImage from './assets/forgiveness.jpg'
import hopeImage from './assets/hope.jpg'
import lonelinessImage from './assets/loneliness.jpg'
import loveImage from './assets/love.jpg'
import securityImage from './assets/security.jpg'
import significanceImage from './assets/significance.jpg'

type ChildTag = Tag & { parentId: string }

function tagImage(tagLabel?: string):
  | {
      tagImg: StaticImageData
      backgroundStyle: string
    }
  | undefined {
  switch (tagLabel) {
    case 'Depression':
      return {
        tagImg: depressionImage,
        backgroundStyle:
          'linear-gradient(0deg, rgba(66, 66, 66, 0.8) 0%,rgba(66, 66, 66, 0) 60%,rgba(66, 66, 66, 0.0) 100%)'
      }
    case 'Anxiety':
      return {
        tagImg: fearAnxietyImage,
        backgroundStyle:
          'linear-gradient(0deg, rgba(78, 20, 140, 0.8) 0%,rgba(78, 20, 140, 0) 60%,rgba(78, 20, 140, 0) 100%)'
      }
    case 'Forgiveness':
      return {
        tagImg: forgivenessImage,
        backgroundStyle:
          'linear-gradient(0deg, rgba(6, 214, 160, 0.8) 0%,rgba(6, 214, 160, 0) 60%,rgba(6, 214, 160, 0) 100%)'
      }
    case 'Hope':
      return {
        tagImg: hopeImage,
        backgroundStyle:
          'linear-gradient(0deg, rgba(255, 166, 134, 0.8) 0%,rgba(255, 166, 134, 0) 60%, rgba(255, 166, 134, 0) 100%)'
      }
    case 'Loneliness':
      return {
        tagImg: lonelinessImage,
        backgroundStyle:
          'linear-gradient(0deg, rgba(17, 138, 178, 0.8) 0%,rgba(17, 138, 178, 0) 60%, rgba(17, 138, 178, 0) 100%)'
      }
    case 'Love':
      return {
        tagImg: loveImage,
        backgroundStyle:
          'linear-gradient(0deg, rgba(240, 80, 174, 0.8) 0%,rgba(240, 80, 174, 0) 60%, rgba(240, 80, 174, 0) 100%)'
      }
    case 'Security':
      return {
        tagImg: securityImage,
        backgroundStyle:
          'linear-gradient(0deg, rgba(0, 127, 255, 0.8) 0%,rgba(0, 127, 255, 0) 60%, rgba(0, 127, 255, 0) 100%)'
      }
    case 'Significance':
      return {
        tagImg: significanceImage,
        backgroundStyle:
          'linear-gradient(0deg, rgba(255, 171, 0, 0.8) 0%,rgba(255, 171, 0, 0) 60%, rgba(255, 171, 0, 0) 100%)'
      }
    case 'Acceptance':
      return {
        tagImg: acceptanceImage,
        backgroundStyle:
          'linear-gradient(0deg, rgba(44, 224, 231, 0.8) 0%,rgba(44, 224, 231, 0) 60%,rgba(44, 224, 231, 0.0) 100%)'
      }
  }
}

interface FeltNeedsButtonProps {
  item?: ChildTag
  onClick: (value: string) => void
}

export function FeltNeedsButton({
  item: tag,
  onClick
}: FeltNeedsButtonProps): ReactElement {
  const theme = useTheme()
  const tagLabel = tag?.name[0]?.value
  const tagImageData = tagImage(tagLabel)
  const image = tagImageData?.tagImg

  return tag != null ? (
    <ButtonBase
      key={`${tagLabel ?? 'felt-needs'}-button}`}
      sx={{
        backgroundColor: 'grey',
        padding: '32px 28px',
        color: 'white',
        borderRadius: '8px',
        width: { xs: '150px', md: '222px' },
        height: { xs: '56px', md: '110px' },
        overflow: 'hidden',
        '&:focus': {
          outline: '2px solid',
          outlineColor: theme.palette.primary.main,
          outlineOffset: '2px'
        },
        '&:hover': {
          '& .hoverStyles': {
            transform: 'scale(1.05)'
          }
        },
        '& .hoverStyles': {
          transition: theme.transitions.create('transform')
        }
      }}
      onClick={() => tag?.id != null && onClick(tag.id)}
    >
      <Box
        data-testid="gradientLayer"
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          background: tagImageData?.backgroundStyle
        }}
      />
      {image != null && (
        <NextImage
          priority
          className="hoverStyles"
          src={image}
          alt={`${tagLabel} tag` ?? 'FeltNeedsImage'}
          sizes={`(max-width: ${
            theme.breakpoints.values.md - 0.5
          }px) 150px, 222px`}
          fill
        />
      )}
      <Typography
        className="hoverStyles"
        variant="h3"
        sx={{
          zIndex: 3,
          display: { xs: 'none', md: 'flex' },
          position: 'absolute',
          opacity: '70%',
          left: 12,
          bottom: 8,
          mixBlendMode: 'plus-lighter'
        }}
      >
        {tagLabel ?? <Skeleton width={80} />}
      </Typography>
      <Typography
        className="hoverStyles"
        variant="subtitle2"
        sx={{
          zIndex: 1,
          display: { md: 'none' },
          position: 'absolute',
          opacity: '70%',
          left: 8,
          bottom: 4,
          mixBlendMode: 'plus-lighter'
        }}
      >
        {tagLabel ?? <Skeleton width={80} />}
      </Typography>
    </ButtonBase>
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
