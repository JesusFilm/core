import IconButton from '@mui/material/IconButton'
import { ComponentProps, ReactElement } from 'react'

import ArrowLeftIcon from '../../icons/ArrowLeft'

export function PreviousButton({
  type,
  onClick,
  disabled
}: ComponentProps<'button'>): ReactElement {
  return (
    <IconButton onClick={onClick} disabled={disabled} type={type}>
      <ArrowLeftIcon fontSize="inherit" />
    </IconButton>
  )
}
