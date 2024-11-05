import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useState } from 'react'

import { CopyTextField } from '@core/shared/ui/CopyTextField'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import EmailIcon from '@core/shared/ui/icons/Email'
import LinkIcon from '@core/shared/ui/icons/Link'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { MenuItem } from '../../MenuItem'

import { EmailInviteForm } from './EmailInviteForm'

interface AddUserSectionProps {
  users: string[]
  journeyId: string
}

export function AddUserSection({
  users,
  journeyId
}: AddUserSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [selectedInviteMethod, setSelectedInviteMethod] = useState('Email')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const menuOpen = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuItemClick = (name: string): void => {
    setAnchorEl(null)
    setSelectedInviteMethod(name)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  return (
    <Stack flexGrow={1} sx={{ m: 4, mt: 2 }} data-testid="AddUserSection">
      <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
        <UsersProfiles2Icon />
        <Typography variant="subtitle1" sx={{ marginLeft: 3 }}>
          {t('Add editor by')}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={
            selectedInviteMethod === 'Email' ? (
              <EmailIcon
                sx={{
                  height: '24px',
                  width: '24px',
                  color: 'secondary.light'
                }}
              />
            ) : (
              <LinkIcon
                sx={{
                  height: '24px',
                  width: '24px',
                  color: 'secondary.light'
                }}
              />
            )
          }
          endIcon={<ChevronDownIcon />}
          aria-controls={menuOpen ? 'menu' : undefined}
          sx={{
            borderRadius: '16px',
            height: '32px',
            color: 'secondary.dark',
            borderWidth: '1px',
            borderColor: 'divider',
            padding: 1,
            marginLeft: 2,
            '&:hover': {
              borderColor: 'divider'
            }
          }}
          onClick={handleClick}
        >
          <Typography variant="body2">{t(selectedInviteMethod)}</Typography>
        </Button>
        <Menu
          id="menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleClose}
        >
          <MenuItem
            icon={<EmailIcon fontSize="small" />}
            label={t('Email')}
            onClick={() => handleMenuItemClick('Email')}
          />
          <MenuItem
            icon={<LinkIcon fontSize="small" />}
            label={t('Link')}
            onClick={() => handleMenuItemClick('Link')}
          />
        </Menu>
      </Stack>
      {selectedInviteMethod === 'Email' ? (
        <EmailInviteForm users={users} journeyId={journeyId} />
      ) : (
        <CopyTextField
          value={
            typeof window !== 'undefined'
              ? `${
                  window.location.host.endsWith('.chromatic.com')
                    ? 'https://admin.nextstep.is'
                    : window.location.origin
                }/journeys/${journeyId}`
              : undefined
          }
          messageText={t('Editor invite link copied')}
          helperText={t('Users invited by link will request approval.')}
        />
      )}
    </Stack>
  )
}
