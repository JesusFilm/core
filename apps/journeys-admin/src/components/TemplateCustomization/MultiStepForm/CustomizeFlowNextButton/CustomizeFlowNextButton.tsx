import Button from '@mui/material/Button'
import { SxProps, Theme } from '@mui/material/styles'
import { ReactElement } from 'react'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

interface CustomizeFlowNextButtonProps {
  label: string
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  form?: string
  ariaLabel?: string
  onClick?: () => void
  sx?: SxProps<Theme>
}

export const CustomizeFlowNextButton = ({
  label,
  loading = false,
  disabled = false,
  type = 'button',
  form,
  ariaLabel,
  onClick,
  sx = {}
}: CustomizeFlowNextButtonProps): ReactElement => {
  return (
    <Button
      variant="blockContained"
      color="solid"
      type={type}
      form={form}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid="CustomizeFlowNextButton"
      endIcon={<ArrowRightIcon />}
      sx={{
        width: { xs: '100%', sm: '216px' },
        alignSelf: 'center',
        mt: { xs: 6, sm: 4 },
        ...sx
      }}
    >
      {label}
    </Button>
  )
}
