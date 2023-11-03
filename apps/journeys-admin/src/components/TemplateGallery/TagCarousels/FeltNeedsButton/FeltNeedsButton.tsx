import ButtonBase from '@mui/material/ButtonBase'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import acceptanceImage from '../assets/acceptance.png'
import depressionImage from '../assets/depression.png'
import fearAnxietyImage from '../assets/fearAnxiety.png'
import forgivenessImage from '../assets/forgiveness.png'
import hopeImage from '../assets/hope.png'
import lonelinessImage from '../assets/loneliness.png'
import loveImage from '../assets/love.png'
import securityImage from '../assets/security.png'
import significanceImage from '../assets/significance.png'

const StyledFeltNeedsButton = styled(ButtonBase)(() => ({
  backgroundColor: 'grey',
  padding: '32px 28px',
  color: 'white',
  borderRadius: '8px'
}))

export function FeltNeedsButton({ item: tag, index, onChange }): ReactElement {
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

  const tagLabel: string = tag.name[0].value ?? `felt-needs-${index as string}`
  const image = tagImage(tagLabel)

  return (
    <StyledFeltNeedsButton
      key={`${tagLabel}-button}`}
      sx={{
        width: { xs: '150px', md: '100%' },
        height: { xs: '56px', md: '110px' }
      }}
      onClick={() => onChange(tag.id)}
    >
      {image != null && (
        <NextImage src={image.src} layout="fill" sx={{ borderRadius: 2 }} />
      )}
      <Typography
        variant="h3"
        sx={{ zIndex: 1, display: { xs: 'none', md: 'flex' } }}
      >
        {tagLabel}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{ zIndex: 1, display: { md: 'none' } }}
      >
        {tagLabel}
      </Typography>
    </StyledFeltNeedsButton>
  )
}
