import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { FC, MouseEvent, useState } from 'react'

interface HeaderProps {
  title?: string
  hasBack?: boolean
}

export const Header: FC<HeaderProps> = ({ title, hasBack }) => {
  const [accountMenu, setAccountMenu] = useState<HTMLElement | null>(null)
  const accountMenuOpen = Boolean(accountMenu)
  const user = useUser()
  const router = useRouter()
  const { t } = useTranslation()

  const handleAccountMenuOpen = (event: MouseEvent<HTMLElement>): void => {
    setAccountMenu(event.currentTarget)
  }

  const handleAccountMenuClose = (): void => {
    setAccountMenu(null)
  }

  const logout = async (): Promise<void> => {
    await user.signOut()
  }

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" alignItems="center">
        {hasBack === true && (
          <IconButton onClick={() => router.back()}>
            <KeyboardArrowLeftIcon
              sx={{
                color: '#000'
              }}
            />
          </IconButton>
        )}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700
          }}
        >
          {title}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={2}>
        <IconButton>
          <TranslateOutlinedIcon />
        </IconButton>
        <IconButton>
          <Badge color="primary" variant="dot">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
        <IconButton
          onClick={handleAccountMenuOpen}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={accountMenuOpen ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={accountMenuOpen ? 'true' : undefined}
        >
          <Avatar
            alt={user?.displayName ?? ''}
            src={user?.photoURL ?? ''}
            sx={{ width: 30, height: 30 }}
          />
        </IconButton>
      </Stack>
      <Menu
        anchorEl={accountMenu}
        id="account-menu"
        open={accountMenuOpen}
        onClose={handleAccountMenuClose}
        onClick={handleAccountMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Stack
          spacing={1}
          sx={{
            py: 2,
            px: 4
          }}
        >
          <Typography variant="subtitle3">
            {t('Hi')} {user?.displayName},
          </Typography>
          <Typography variant="caption">{user?.email}</Typography>
        </Stack>
        <Divider />
        <MenuItem
          sx={{
            color: 'error.main',
            fontWeight: 700
          }}
          onClick={logout}
        >
          {t('Logout')}
        </MenuItem>
      </Menu>
    </Stack>
  )
}
