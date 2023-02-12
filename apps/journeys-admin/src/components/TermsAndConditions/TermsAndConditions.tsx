import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Fab from '@mui/material/Fab'
import Stack from '@mui/material/Stack'
import List from '@mui/material/List'
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded'
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded'
import BeenhereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Image from 'next/image'
import NextLink from 'next/link'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import { gql, useMutation } from '@apollo/client'
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
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
            icon={
              <NewReleasesRoundedIcon
                sx={{ color: 'secondary.light', ml: 3 }}
              />
            }
            text="Terms of Use"
          />
          <Divider />
          <TermsListItem
            link="https://your.nextstep.is/end-user-license-agreement"
            icon={
              <SupervisorAccountRoundedIcon
                sx={{ color: 'secondary.light', ml: 3 }}
              />
            }
            text="End User License Agreement"
          />
          <Divider />
          <TermsListItem
            link="https://your.nextstep.is/community-guidelines"
            icon={
              <BeenhereRoundedIcon sx={{ color: 'secondary.light', ml: 3 }} />
            }
            text="Community Guidelines"
          />
          <Divider />
          <ListItem disablePadding>
            <FormControlLabel
              control={<Checkbox onChange={() => setAccepted(!accepted)} />}
              label="I agree with listed above conditions and requirements"
              sx={{
                pl: 4,
                pt: 6,
                pb: 4,
                display: 'flex',
                justifyContent: 'flex-start'
              }}
            />
          </ListItem>
        </List>
        <NextLink href="/" passHref>
          <Fab
            variant="extended"
            size="large"
            disabled={!accepted}
            onClick={async () => await journeyProfileCreate()}
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
        </NextLink>
      </Stack>

      <Typography
        variant="body2"
        sx={{
          mt: 17,
          color: 'primary.main',
          cursor: 'pointer',
          textDecoration: 'none'
        }}
        component="a"
        href="mailto:support@nextstep.is?Subject=Support%2FFeedback%20Request"
      >
        Feedback & Support
      </Typography>
    </Box>
  )
}
