import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SxProps, Theme } from '@mui/material/styles'
import { ReactElement } from 'react'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

import {
  BUTTON_NEXT_STEP_WIDTH,
  BUTTON_NEXT_STEP_HEIGHT
} from '../../utils/sharedStyles'

interface CustomizeFlowNextButtonProps {
  label?: string
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  form?: string
  ariaLabel?: string
  testId?: string
  onClick?: () => void
  sx?: SxProps<Theme>
}

export const CustomizeFlowNextButton = ({
  label = '',
  loading = false,
  disabled = false,
  type = 'button',
  form,
  ariaLabel,
  testId,
  onClick,
  sx = {}
}: CustomizeFlowNextButtonProps): ReactElement => {
  return (
    <Button
      variant="contained"
      color="secondary"
      type={type}
      form={form}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid={testId}
      sx={{
        width: BUTTON_NEXT_STEP_WIDTH,
        height: BUTTON_NEXT_STEP_HEIGHT,
        alignSelf: 'center',
        mt: { xs: 6, sm: 4 },
        borderRadius: '8px',
        ...sx
      }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography
          sx={{
            fontWeight: 'bold',
            display: { xs: 'none', sm: 'block' }
          }}
        >
          {label}
        </Typography>
        <ArrowRightIcon sx={{ fontSize: { xs: '24px', sm: '16px' } }} />
      </Stack>
    </Button>
  )
}
