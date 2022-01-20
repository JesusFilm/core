import { gql, useMutation } from '@apollo/client'
import { ReactElement, useState } from 'react'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Image from 'next/image'
import Link from 'next/link'
import { UserJourneyRequest } from '../../../__generated__/UserJourneyRequest'
import logo from '../../../public/logo.svg'

export const USER_JOURNEY_REQUEST = gql`
  mutation UserJourneyRequest($journeyId: ID!) {
    userJourneyRequest(journeyId: $journeyId, idType: slug) {
      id
    }
  }
`

export interface JourneyInviteProps {
  journeySlug: string
  requestReceived?: boolean
}

export function JourneyInvite({
  journeySlug,
  requestReceived: initialRequestReceived
}: JourneyInviteProps): ReactElement {
  const [userJourneyRequest] =
    useMutation<UserJourneyRequest>(USER_JOURNEY_REQUEST)
  const [requestReceived, setRequestReceived] = useState(
    Boolean(initialRequestReceived)
  )

  const handleClick = async (): Promise<void> => {
    await userJourneyRequest({
      variables: { journeyId: journeySlug }
    })
    setRequestReceived(true)
  }

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pb: 10
        }}
      >
        <Link href="/" passHref>
          <a>
            <Image src={logo} alt="Next Steps" height={68} width={152} />
          </a>
        </Link>
      </Box>
      <Card variant="outlined">
        {!requestReceived && (
          <>
            <CardContent>
              <Typography variant="h3" component="h1" gutterBottom>
                You need access
              </Typography>
              <Typography>
                Ask for access, or switch to an account with access to this
                journey.
              </Typography>
            </CardContent>
            <CardActions>
              <Button onClick={handleClick}>Request Access</Button>
            </CardActions>
          </>
        )}
        {requestReceived && (
          <CardContent>
            <Typography variant="h3" component="h1" gutterBottom>
              Request sent
            </Typography>
            <Typography>
              The owner will let you know when the journey has been shared with
              you.
            </Typography>
          </CardContent>
        )}
      </Card>
    </Container>
  )
}
