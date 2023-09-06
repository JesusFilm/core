import { gql, useMutation } from '@apollo/client'
import BeenhereRoundedIcon from '@mui/icons-material/BeenhereRounded' // icon-replace: no icon serves similar purpose
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded' // icon-replace: no icon serves similar purpose
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded' // icon-replace: no icon serves similar purpose
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import ArrowRightSm from '@core/shared/ui/icons/ArrowRightSm'

import { JourneyProfileCreate } from '../../../__generated__/JourneyProfileCreate'
import taskbarIcon from '../../../public/taskbar-icon.svg'

import { TermsListItem } from './TermsListItem'

export const JOURNEY_PROFILE_CREATE = gql`
  mutation JourneyProfileCreate {
    journeyProfileCreate {
      id
      userId
      acceptedTermsAt
    }
  }
`

export function TermsAndConditions(): ReactElement {
  const [accepted, setAccepted] = useState(false)
  const [journeyProfileCreate] = useMutation<JourneyProfileCreate>(
    JOURNEY_PROFILE_CREATE
  )
  const router = useRouter()

  const handleJourneyProfileCreate = async (): Promise<void> => {
    await journeyProfileCreate()
    await router.push('/?onboarding=true')
  }

  return (
    <Stack
      justifyContent="space-evenly"
      alignItems="center"
      sx={{ height: '100vh', minHeight: '600px' }}
    >
      <Stack
        alignItems="center"
        sx={{ maxWidth: { xs: '311px', sm: '311px', md: '397px' } }}
      >
        <Box sx={{ mb: 10, flexShrink: 0 }}>
          <Image src={taskbarIcon} alt="Next Steps" height={43} width={43} />
        </Box>
        <Typography variant="h4">Before You Start</Typography>
        <Typography variant="body1" sx={{ mt: 3 }}>
          Please review these documents:
        </Typography>
        <List
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '6px',
            mt: 6,
            overflow: 'hidden'
          }}
          disablePadding
        >
          <TermsListItem
            link="https://your.nextstep.is/terms-of-use"
            icon={<NewReleasesRoundedIcon sx={{ color: 'secondary.light' }} />}
            text="Terms of Use"
          />
          <Divider component="li" />
          <TermsListItem
            link="https://your.nextstep.is/end-user-license-agreement"
            icon={
              <SupervisorAccountRoundedIcon sx={{ color: 'secondary.light' }} />
            }
            text="End User License Agreement"
          />
          <Divider component="li" />
          <TermsListItem
            link="https://your.nextstep.is/community-guidelines"
            icon={<BeenhereRoundedIcon sx={{ color: 'secondary.light' }} />}
            text="Community Guidelines"
          />
          <Divider component="li" />
          <ListItemButton onClick={() => setAccepted(!accepted)}>
            <ListItemIcon sx={{ minWidth: 44 }}>
              <Checkbox
                edge="start"
                checked={accepted}
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': 'i-agree-label' }}
                sx={{ p: 0, ml: 0 }}
              />
            </ListItemIcon>
            <ListItemText
              id="i-agree-label"
              primary={
                <Typography variant="body1" color="secondary.dark">
                  I agree with listed above conditions and requirements
                </Typography>
              }
            />
          </ListItemButton>
        </List>
        <Button
          variant="contained"
          disabled={!accepted}
          onClick={handleJourneyProfileCreate}
          sx={{
            mt: 6,
            width: '100%',
            borderRadius: '12px',
            bgcolor: 'secondary.dark',
            py: 3.25,
            color: 'secondary.contrastText',
            '&:hover': {
              bgcolor: 'secondary.dark'
            }
          }}
          endIcon={<ArrowRightSm />}
        >
          Next
        </Button>
      </Stack>
      <Link
        variant="body2"
        underline="none"
        sx={{
          color: 'primary.main',
          cursor: 'pointer'
        }}
        href="mailto:support@nextstep.is?subject=A question about the terms and conditions form"
      >
        Feedback & Support
      </Link>
    </Stack>
  )
}
