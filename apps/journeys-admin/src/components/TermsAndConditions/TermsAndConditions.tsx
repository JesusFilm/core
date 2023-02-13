import { ReactElement, useState } from 'react'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Fab from '@mui/material/Fab'
import Stack from '@mui/material/Stack'
import List from '@mui/material/List'
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded'
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded'
import BeenhereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Image from 'next/image'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import { gql, useMutation } from '@apollo/client'
import Link from '@mui/material/Link'
import { useRouter } from 'next/router'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import taskbarIcon from '../../../public/taskbar-icon.svg'
import { JourneyProfileCreate } from '../../../__generated__/JourneyProfileCreate'
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
    await router.push('/')
  }

  return (
    <Stack
      justifyContent="flex-start"
      alignItems="center"
      sx={{
        pt: 30,
        ml: 20
      }}
    >
      <Image src={taskbarIcon} alt="Next Steps" height={68} width={152} />
      <Stack
        alignItems="center"
        sx={{ maxWidth: { xs: '311px', sm: '311px', md: '397px' } }}
      >
        <Typography variant="h4" sx={{ mt: 20 }}>
          Before You Start
        </Typography>
        <Typography variant="body1" sx={{ mt: 3 }}>
          Please review the next documents:
        </Typography>
        <List
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '6px',
            mt: 6
          }}
          disablePadding
        >
          <TermsListItem
            link="https://your.nextstep.is/terms-of-use"
            icon={<NewReleasesRoundedIcon sx={{ color: 'secondary.light' }} />}
            text="Terms of Use"
          />
          <Divider />
          <TermsListItem
            link="https://your.nextstep.is/end-user-license-agreement"
            icon={
              <SupervisorAccountRoundedIcon sx={{ color: 'secondary.light' }} />
            }
            text="End User License Agreement"
          />
          <Divider />
          <TermsListItem
            link="https://your.nextstep.is/community-guidelines"
            icon={<BeenhereRoundedIcon sx={{ color: 'secondary.light' }} />}
            text="Community Guidelines"
          />
          <Divider />
          <ListItem sx={{ pt: 6, pl: 2 }}>
            <ListItemIcon sx={{ minWidth: '52px' }}>
              <Checkbox onChange={() => setAccepted(!accepted)} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body1" color="secondary.dark">
                  I agree with listed above conditions and requirements
                </Typography>
              }
            />
          </ListItem>
        </List>
        <Fab
          variant="extended"
          size="large"
          disabled={!accepted}
          onClick={handleJourneyProfileCreate}
          sx={{
            mt: 6,
            width: '100%',
            borderRadius: '12px',
            bgcolor: 'secondary.dark',
            color: 'secondary.contrastText',
            '&:hover': {
              bgcolor: 'secondary.dark'
            }
          }}
        >
          <ArrowForwardIcon />
          Next
        </Fab>
      </Stack>
      <Link
        variant="body2"
        underline="none"
        sx={{
          mt: 17,
          color: 'primary.main',
          cursor: 'pointer'
        }}
        href="mailto:support@nextstep.is?Subject=Support%2FFeedback%20Request"
      >
        Feedback & Support
      </Link>
    </Stack>
  )
}
