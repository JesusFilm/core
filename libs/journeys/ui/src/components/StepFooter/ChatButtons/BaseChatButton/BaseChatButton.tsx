import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

interface BaseChatButtonProps extends IconButtonProps {
  primary: boolean
  children: ReactNode
}

export function BaseChatButton({
  primary,
  children,
  ...rest
}: BaseChatButtonProps): ReactElement {
  const theme = useTheme()

  return (
    <IconButton
      {...rest}
      sx={{
        height: 44,
        width: 44,
        backgroundColor: primary ? theme.palette.grey[100] : '#dedfe026',
        '&:hover': {
          backgroundColor: primary ? theme.palette.grey[100] : '#dedfe026'
        }
      }}
    >
      {children}
    </IconButton>
  )
}
