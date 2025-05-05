import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import Image from 'next/image'
import { SnackbarContent } from 'notistack'
import { ReactElement } from 'react'

import LinkExternal from '@core/shared/ui/icons/LinkExternal'

const StyledSnackbarContent = styled(SnackbarContent)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,

  color: theme.palette.secondary.dark,

  border: `1px solid ${theme.palette.divider}`,

  borderRadius: 16,

  fontWeight: 500,

  height: 86,

  width: 374,

  display: 'flex',

  justifyContent: 'space-evenly',

  alignItems: 'center',

  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1)
  }
}))

interface TranslateNotificationProps {
  message: string
}

export function TranslateNotification({
  message
}: TranslateNotificationProps): ReactElement {
  return (
    <StyledSnackbarContent role="alert">
      <Image
        src={'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3'}
        alt="Translate Notification"
        width={62}
        height={62}
      />

      {message}

      <IconButton>
        <LinkExternal />
      </IconButton>
    </StyledSnackbarContent>
  )
}
