import Box, { BoxProps } from '@mui/material/Box'
import Button, { ButtonProps } from '@mui/material/Button'
import Card, { CardProps } from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import LogoGrayscale from '@core/shared/ui/icons/LogoGrayscale'

export const StyledGridRadioOption = styled(Card)<CardProps>(({ theme }) => ({
  borderRadius: 16,
  padding: 12,
  height: '100%',
  minHeight: '80px',
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(254, 254, 254, 0.40)'
      : 'rgba(0, 0, 0, 0.15)'
}))

interface GridVariantProps {
  label: string
  selected?: boolean
  disabled?: boolean
  handleClick: (e: React.MouseEvent) => void
  editableLabel?: ReactElement
}

export function GridVariant({
  label,
  selected = false,
  disabled = false,
  handleClick,
  editableLabel
}: GridVariantProps): ReactElement {
  const showLabel = editableLabel != null || (label != null && label != '')

  return (
    <StyledGridRadioOption
      // variant="outlined"
      // disabled={disabled}
      onClick={handleClick}
      // fullWidth
      // disableRipple
      className={selected ? 'selected' : ''}
      sx={{}}
      data-testid="JourneysRadioOption"
    >
      <Stack gap={2}>
        <Box
          sx={{
            width: '100%',
            minWidth: '106px',
            minHeight: '106px',
            maxHeight: '127px',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? '#26262E' : '#6D6F81',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2
          }}
        >
          <LogoGrayscale sx={{ width: '50px', height: '34px' }} />
        </Box>
        {showLabel && (
          <Typography
            variant="body2"
            sx={{
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#1D1D1D' : '#FFFFFF'
            }}
          >
            {editableLabel ?? label}
          </Typography>
        )}
      </Stack>
    </StyledGridRadioOption>
  )
}

// editableLabel != null
//   ? {
//       '&:hover': {
//         backgroundColor: (theme) => theme.palette.primary.contrastText
//       },
//       transform: 'translateY(0px) !important'
//     }
//   : undefined
