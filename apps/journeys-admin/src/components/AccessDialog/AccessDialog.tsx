import { ReactElement, MouseEvent, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import List from '@mui/material/List'
import MuiListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { gql, useLazyQuery } from '@apollo/client'
import { compact } from 'lodash'
import {
  GetJourneyWithUserJourneys,
  GetJourneyWithUserJourneys_journey_userJourneys as UserJourney
} from '../../../__generated__/GetJourneyWithUserJourneys'
import { RemoveUser } from './RemoveUser'
import { ApproveUser } from './ApproveUser'
import { PromoteUser } from './PromoteUser'

export const GET_JOURNEY_WITH_USER_JOURNEYS = gql`
  query GetJourneyWithUserJourneys($id: ID!) {
    journey: adminJourney(id: $id, idType: slug) {
      id
      userJourneys {
        id
        role
        user {
          id
          firstName
          lastName
          email
          imageUrl
        }
      }
    }
  }
`

interface InviteUserModalProps {
  journeySlug: string
  open?: boolean
  onClose?: () => void
}

export function AccessDialog({
  journeySlug,
  open,
  onClose
}: InviteUserModalProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const [loadJourney, { loading, data, error }] =
    useLazyQuery<GetJourneyWithUserJourneys>(GET_JOURNEY_WITH_USER_JOURNEYS, {
      variables: { id: journeySlug },
      fetchPolicy: 'network-only'
    })

  console.log(error)

  useEffect(() => {
    if (open === true) {
      void loadJourney()
    }
  }, [open, loadJourney])

  const handleCopyClick = async (): Promise<void> => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/journeys/${journeySlug}`
    )
  }

  return (
    <Dialog
      open={open ?? false}
      onClose={onClose}
      fullScreen={!smUp}
      maxWidth="sm"
    >
      <Box
        sx={{
          mx: 6,
          my: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="subtitle1">Invite Other Editors</Typography>
        <IconButton onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>
      <DialogContent dividers>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            <MuiListItem sx={{ px: 0 }}>
              <TextField
                fullWidth
                hiddenLabel
                defaultValue={`${window.location.origin}/journeys/${journeySlug}`}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkRoundedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopyClick}>
                        <ContentCopyRoundedIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  readOnly: true
                }}
                variant="filled"
                helperText="Anyone with this link can see journey and ask for editing rights.
            You can accept or reject every request."
              />
            </MuiListItem>
            <Divider sx={{ my: 2 }} />
            <MuiListItem sx={{ px: 0 }}>Requested Editing Rights</MuiListItem>
            {data?.journey?.userJourneys?.map(
              (userJourney) =>
                userJourney.role === 'inviteRequested' && (
                  <ListItem key={userJourney.id} {...userJourney} />
                )
            )}
            <Divider sx={{ my: 2 }} />
            <MuiListItem sx={{ px: 0 }}>Users With Access</MuiListItem>
            {data?.journey?.userJourneys?.map(
              (userJourney) =>
                userJourney.role !== 'inviteRequested' && (
                  <ListItem key={userJourney.id} {...userJourney} />
                )
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ListItem({ id, user, role }: UserJourney): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  const displayName = compact([user?.firstName, user?.lastName]).join(' ')

  return (
    <>
      <MuiListItem
        sx={{
          px: 0,
          '& > .MuiListItemSecondaryAction-root': {
            right: 0
          }
        }}
        secondaryAction={
          <Button
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            disabled={role === 'owner'}
            endIcon={<ArrowDropDownIcon />}
          >
            {role === 'inviteRequested' && 'Manage'}
            {role === 'owner' && 'Owner'}
            {role === 'editor' && 'Editor'}
          </Button>
        }
      >
        <ListItemAvatar>
          <Avatar src={user?.imageUrl ?? undefined} alt={displayName} />
        </ListItemAvatar>
        <ListItemText primary={displayName} secondary={user?.email} />
      </MuiListItem>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {role === 'inviteRequested' ? (
          <ApproveUser id={id} />
        ) : (
          <PromoteUser id={id} />
        )}
        <Divider />
        <RemoveUser id={id} />
      </Menu>
    </>
  )
}
