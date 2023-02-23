import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import NewReleasesRounded from '@mui/icons-material/NewReleasesRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'

export function InviteRequirementMessage(): ReactElement {
  return (
    <Container maxWidth="sm" sx={{ mt: 20 }}>
      <Stack direction="column" spacing={8} alignItems="center">
        <NewReleasesRounded sx={{ fontSize: 60 }} />
        <Typography variant="h1" align="center">
          You need to be invited to create the first journey
        </Typography>
        <Typography variant="subtitle2" align="center">
          Someone with a full account should add you to their journey as an
          editor, after that you will have full access
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<ContactSupportRounded />}
            size="medium"
            onClick={() => {
              window.location.href = `mailto:support@nextstep.is?subject=Invite request for the NextStep builder`
            }}
          >
            Contact Support
          </Button>
        </Box>
      </Stack>
    </Container>
  )
}
