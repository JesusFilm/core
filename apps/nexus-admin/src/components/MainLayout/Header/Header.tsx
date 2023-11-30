import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import { Avatar, IconButton, Stack, Typography } from '@mui/material'
import { FC } from 'react'

interface HeaderProps {
  title: string
}

export const Header: FC<HeaderProps> = ({ title }) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700
        }}
      >
        {title}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={2}>
        <IconButton>
          <TranslateOutlinedIcon />
        </IconButton>
        <IconButton>
          <NotificationsNoneOutlinedIcon />
        </IconButton>
        <Avatar
          alt="Remy Sharp"
          src="https://mui.com/static/images/avatar/1.jpg"
          sx={{ width: 30, height: 30 }}
        />
      </Stack>
    </Stack>
  )
}
