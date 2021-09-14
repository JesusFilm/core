import { ReactElement } from 'react'
import { Button as MuiButton } from '@mui/material'
import { CheckCircle, PlayArrow } from '@mui/icons-material'
import { ButtonType } from './buttonTypes'

export interface ButtonProps extends ButtonType {
  loading?: boolean
  disabled?: boolean
}

export function Button (props: ButtonProps): ReactElement {
  const setIcon = (icon: string | undefined): ReactElement | null => {
    switch (icon) {
      case 'checkCircle':
        return <CheckCircle />
      case 'playArrow':
        return <PlayArrow />
      default:
        return null
    }
  }

  return (
    <MuiButton {...props}
    startIcon={props.startIcon?.icon !== null ? setIcon(props.startIcon?.icon) : null}
    endIcon={props.endIcon?.icon !== null ? setIcon(props.endIcon?.icon) : null}>
        {props.label}
    </MuiButton>
  )
}
