import { gql, useMutation } from '@apollo/client'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ConnectWithoutContactOutlinedIcon from '@mui/icons-material/ConnectWithoutContactOutlined'
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import sortBy from 'lodash/sortBy'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'
import { TeamAvatars } from '../TeamAvatars'
import { TeamCreateDialog } from '../TeamCreateDialog'
import { TeamManageDialog } from '../TeamManageDialog'
import { useTeam } from '../TeamProvider'
import { TeamUpdateDialog } from '../TeamUpdateDialog'

export const UPDATE_LAST_ACTIVE_TEAM_ID = gql`
  mutation UpdateLastActiveTeamId($input: JourneyProfileUpdateInput!) {
    journeyProfileUpdate(input: $input) {
      id
    }
  }
`

interface TeamSelectProps {
  onboarding?: boolean
}
export function TeamSelect({ onboarding }: TeamSelectProps): ReactElement {
  const theme = useTheme()
  const { query, activeTeam, setActiveTeam } = useTeam()
  const { t } = useTranslation('apps-journeys-admin')

  const [open, setOpen] = useState(onboarding ?? false)
  const [teamManageOpen, setTeamManageOpen] = useState(false)
  const [teamCreateOpen, setTeamCreateOpen] = useState(false)
  const [teamUpdateOpen, setTeamUpdateOpen] = useState(false)
  const [keepDropdownOpen, setKeepDropdownOpen] = useState(false)
  const [openTeamDropdown, setOpenTeamDropdown] = useState(false)

  const anchorRef = useRef(null)
  const listItemRefs = useRef<Array<HTMLDivElement | null>>([])
  const activeItemRef = useRef<HTMLDivElement | null>(null)

  const [updateLastActiveTeamId] = useMutation<UpdateLastActiveTeamId>(
    UPDATE_LAST_ACTIVE_TEAM_ID
  )

  function handleChange(newTeamId: string): void {
    const team = query?.data?.teams.find((team) => team.id === newTeamId)
    void updateLastActiveTeamId({
      variables: {
        input: {
          lastActiveTeamId: team?.id ?? null
        }
      }
    })
    setActiveTeam(team ?? null)
    setOpenTeamDropdown(false)
  }

  useEffect(() => {
    const handleActiveItemChange = (): void => {
      if (openTeamDropdown) {
        // Delay to ensure the modal content is rendered
        setTimeout(() => {
          const activeItem = activeItemRef?.current

          if (activeItem != null) {
            activeItem.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest'
            })

            activeItem.focus()
          }
        }, 100)
      }
    }

    handleActiveItemChange()
  }, [openTeamDropdown])

  const focusNextListItem = (currentIndex: number): void => {
    const nextItem = listItemRefs.current[currentIndex + 1]
    if (nextItem !== null && nextItem !== undefined) {
      nextItem.focus()
    }
  }

  const focusPreviousListItem = (currentIndex: number): void => {
    const peviousItem = listItemRefs.current[currentIndex - 1]
    if (peviousItem !== null && peviousItem !== undefined) {
      peviousItem.focus()
    }
  }

  // Keyboard navigation between list items
  const handleKeyDown = (event: React.KeyboardEvent, index: number): void => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        focusPreviousListItem(index)
        break
      case 'ArrowDown':
        event.preventDefault()
        focusNextListItem(index)
        break
      case 'Escape':
        event.preventDefault()
        setOpenTeamDropdown(false)
        break
      default:
        break
    }
  }

  return (
    <>
      <TeamCreateDialog
        open={teamCreateOpen}
        onCreate={() => {
          setKeepDropdownOpen(true)
          setOpenTeamDropdown(false)
          setTeamManageOpen(true)
        }}
        onClose={() => {
          setKeepDropdownOpen(true)
          setTeamCreateOpen(false)
        }}
      />
      <TeamUpdateDialog
        open={teamUpdateOpen}
        onClose={() => {
          setKeepDropdownOpen(true)
          setTeamUpdateOpen(false)
        }}
      />
      <TeamManageDialog
        open={teamManageOpen}
        onClose={() => {
          setKeepDropdownOpen(true)
          setTeamManageOpen(false)
        }}
      />

      <Button
        onClick={() => {
          setOpenTeamDropdown(true)
        }}
        color="secondary"
        size="large"
        sx={{
          pl: theme.spacing(6),
          pr: theme.spacing(6),
          borderRadius: 0
        }}
        startIcon={
          activeTeam != null ? (
            <GroupsOutlinedIcon ref={anchorRef} />
          ) : (
            <ConnectWithoutContactOutlinedIcon ref={anchorRef} />
          )
        }
        endIcon={<KeyboardArrowDownRoundedIcon />}
      >
        <Typography
          component="span"
          variant="subtitle1"
          align="left"
          noWrap
          sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}
        >
          {activeTeam?.title ?? t('Shared With Me')}
        </Typography>
      </Button>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          flexGrow: 1
        }}
        data-testid="TeamSelect"
      >
        {activeTeam != null && (
          <Chip
            variant="outlined"
            avatar={
              <Box sx={{ ml: '12px' }}>
                <TeamAvatars userTeams={activeTeam.userTeams} />
              </Box>
            }
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setTeamManageOpen(true)
            }}
            label={
              <Typography
                variant="body2"
                component="span"
                sx={{ display: { xs: 'none', sm: 'inline' } }}
              >
                {t('Members')}
              </Typography>
            }
            sx={{
              ml: { xs: 0, sm: theme.spacing(4) },
              px: { xs: 0 },
              '&> .MuiChip-label': {
                px: { xs: '5px', sm: '12px' }
              }
            }}
          />
        )}
      </Box>

      {/* Team Selection Dropdown */}
      <Popover
        open={openTeamDropdown}
        anchorEl={anchorRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        elevation={0}
        sx={{
          mt: theme.spacing(5),
          '&> .MuiPopover-paper': {
            background: 'none',
            overflow: 'visible',
            borderRadius: 0
          },
          '&> .MuiPopover-paper::before': {
            backgroundColor: theme.palette.background.paper,
            content: '""',
            display: 'block',
            position: 'absolute',
            width: 12,
            height: 12,
            top: -6,
            transform: 'rotate(45deg)',
            left: theme.spacing(10)
          }
        }}
      >
        <ClickAwayListener
          onClickAway={(e) => {
            if (
              !keepDropdownOpen &&
              !teamManageOpen &&
              !teamUpdateOpen &&
              !teamCreateOpen
            ) {
              setOpenTeamDropdown(false)
            }
            setKeepDropdownOpen(false)
          }}
        >
          <Paper elevation={3} sx={{ overflow: 'hidden' }}>
            <Box sx={{}}>
              <List
                sx={{
                  width: '100%',
                  bgcolor: 'background.paper',
                  overflow: 'auto',
                  maxHeight: { xs: '60vh', sm: '50vh' },
                  mt: '1px'
                }}
                subheader={<li />}
              >
                <ListItemButton
                  role={undefined}
                  onClick={() => {
                    handleChange('')
                  }}
                  ref={(el) => {
                    listItemRefs.current[0] = el
                    if (activeTeam === null) {
                      activeItemRef.current = el
                    }
                  }}
                  key="shared_with_me"
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  tabIndex={-1}
                >
                  <ListItem>
                    <ListItemIcon
                      sx={{
                        minWidth: theme.spacing(10)
                      }}
                    >
                      {activeTeam === null ? (
                        <CheckCircleIcon color="primary" />
                      ) : (
                        <RadioButtonUncheckedOutlinedIcon
                          sx={{ opacity: 0.5 }}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={t('Shared With Me')}
                      secondary={t('Single journeys shared with you')}
                    />
                  </ListItem>
                </ListItemButton>
              </List>

              <Divider>
                <Typography variant="overline">
                  {/* {t('Teams With Access')} */}
                  {t('Your Teams ')}
                </Typography>
              </Divider>

              <List
                sx={{
                  width: '100%',
                  bgcolor: 'background.paper',
                  overflow: 'auto',
                  maxHeight: { xs: '60vh', sm: '50vh' }
                }}
                subheader={<li />}
              >
                {(query?.data?.teams != null
                  ? sortBy(query.data?.teams, 'title')
                  : []
                ).map((team, index) => (
                  <ListItemButton
                    role={undefined}
                    onClick={() => {
                      handleChange(team.id)
                    }}
                    selected={team.id === activeTeam?.id}
                    // ref={team.id === activeTeam?.id ? activeItemRef : null}
                    ref={(el) => {
                      listItemRefs.current[index + 1] = el
                      if (team.id === activeTeam?.id) {
                        activeItemRef.current = el
                      }
                    }}
                    key={team.id}
                    onKeyDown={(e) => handleKeyDown(e, index + 1)}
                    tabIndex={-1}
                  >
                    <ListItem
                      secondaryAction={
                        team.id === activeTeam?.id ? (
                          <Tooltip title={t('Rename')}>
                            <IconButton
                              edge="end"
                              aria-label="rename"
                              onClick={(e) => {
                                e.stopPropagation()
                                setTeamUpdateOpen(true)
                              }}
                            >
                              <CreateOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Box sx={{ mr: '-2px' }}>
                            <TeamAvatars userTeams={team.userTeams} />
                          </Box>
                        )
                      }
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: theme.spacing(10)
                        }}
                      >
                        {activeTeam?.id === team.id ? (
                          <CheckCircleIcon color="primary" />
                        ) : (
                          <RadioButtonUncheckedOutlinedIcon
                            sx={{ opacity: 0.5 }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={team.title} />
                    </ListItem>
                  </ListItemButton>
                ))}
              </List>

              <Box textAlign="right" sx={{ pr: 4, pb: 4 }}>
                <Button
                  onClick={() => {
                    setTeamCreateOpen(true)
                  }}
                >
                  {t('Create Team')}
                </Button>
              </Box>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popover>

      {/* Onboarding popover */}
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center'
        }}
        PaperProps={{
          sx: {
            maxWidth: { xs: 'calc(100% - 30px)', sm: 300 },
            mt: 4,
            position: 'relative',
            overflow: 'visible',
            '&::before': {
              backgroundColor: 'white',
              content: '""',
              display: 'block',
              position: 'absolute',
              width: 12,
              height: 12,
              top: -6,
              transform: 'rotate(45deg)',
              left: { xs: 20, sm: 10 },
              zIndex: 1
            }
          }
        }}
      >
        <Stack spacing={1} p={6}>
          <Typography variant="h6" gutterBottom>
            {t('More journeys here')}
          </Typography>
          <Typography>
            {t(
              'Journeys are grouped by teams. You can switch between teams by using this dropdown.'
            )}
          </Typography>
          <Box textAlign="right">
            <Button onClick={() => setOpen(false)}>{t('Dismiss')}</Button>
          </Box>
        </Stack>
      </Popover>
    </>
  )
}
