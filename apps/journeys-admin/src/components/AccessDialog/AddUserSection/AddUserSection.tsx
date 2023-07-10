import { ReactElement, MouseEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import DraftsIcon from '@mui/icons-material/Drafts'
import LinkIcon from '@mui/icons-material/Link'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import Typography from '@mui/material/Typography'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { MenuItem } from '../../MenuItem'
import { UserTeamInviteForm } from '../../Team/UserTeamInviteForm'
import { EmailInviteForm } from './EmailInviteForm'

interface AddUserSectionProps {
  users?: string[]
  addTeamMembers?: boolean
}

export function AddUserSection({
  users = [],
  addTeamMembers = false
}: AddUserSectionProps): ReactElement {
  const { journey } = useJourney()
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
    <Stack flexGrow={1} sx={{ m: 4, mt: 2 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
        <GroupAddIcon />
        <Typography variant="subtitle1" sx={{ marginLeft: 3 }}>
          {!addTeamMembers ? t('Add editor by') : t('Add team member by Email')}
        </Typography>
        {!addTeamMembers && (
          <Stack>
            <Button
              variant="outlined"
              size="small"
              startIcon={
                selectedInviteMethod === 'Email' ? <DraftsIcon /> : <LinkIcon />
              }
              endIcon={<KeyboardArrowDownIcon />}
              aria-controls={menuOpen ? 'menu' : undefined}
              sx={{
                borderRadius: '16px',
                width: '124px',
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
              <Typography variant="body2">{selectedInviteMethod}</Typography>
            </Button>
            <Menu
              id="menu"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleClose}
            >
              <MenuItem
                icon={<DraftsIcon fontSize="small" />}
                label="Email"
                onClick={() => handleMenuItemClick('Email')}
              />
              <MenuItem
                icon={<LinkIcon fontSize="small" />}
                label="Link"
                onClick={() => handleMenuItemClick('Link')}
              />
            </Menu>
          </Stack>
        )}
      </Stack>
      {selectedInviteMethod === 'Email' && !addTeamMembers && (
        <EmailInviteForm users={users} />
      )}
      {selectedInviteMethod === 'Link' && !addTeamMembers && (
        <CopyTextField
          value={
            typeof window !== 'undefined'
              ? `${
                  window.location.host.endsWith('.chromatic.com')
                    ? 'https://admin.nextstep.is'
                    : window.location.origin
                }/journeys/${journey != null ? journey.id : ''}`
              : undefined
          }
          messageText={t('Editor invite link copied')}
          helperText={t('Users invited by link will request approval.')}
        />
      )}
      {addTeamMembers && <UserTeamInviteForm />}
    </Stack>
  )
}
