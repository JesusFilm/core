import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import NewReleasesRounded from '@mui/icons-material/NewReleasesRounded'

export interface ContactSupportProps {
  title: string
  description: string
}

export function ContactSupport({
  title,
  description
}: ContactSupportProps): ReactElement {
  return (
    <Container maxWidth="sm" sx={{ mt: 20 }}>
      <Stack direction="column" spacing={8} alignItems="center">
        <NewReleasesRounded sx={{ fontSize: 60 }} />
        <Typography variant="h1" align="center">
          {title}
        </Typography>
        <Typography variant="subtitle2" align="center">
          {description}
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<ContactSupportRounded />}
            size="medium"
            href="mailto:support@nextstep.is?subject=Invite request for the NextStep builder"
          >
            Contact Support
          </Button>
        </Box>
      </Stack>
    </Container>
  )
}
