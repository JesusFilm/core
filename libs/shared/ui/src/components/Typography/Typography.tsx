import { ReactElement } from 'react'
import { Typography as MuiTypography } from '@mui/material'

/* eslint-disable-next-line */
export interface TypographyProps {
  content: string
}

export function Typography (props: TypographyProps): ReactElement {
  return (
    <MuiTypography {...props} >
      {props.content}
    </MuiTypography>
  )
}

export default Typography
