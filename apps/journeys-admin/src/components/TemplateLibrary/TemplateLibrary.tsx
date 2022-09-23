import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import NewReleasesRounded from '@mui/icons-material/NewReleasesRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { GetPublishedTemplates_journeys as Template } from '../../../__generated__/GetPublishedTemplates'
import { TemplateCard } from '../TemplateCard'

interface TemplateLibraryProps {
  journeys?: Journey[]
  templates?: Template[]
}

export function TemplateLibrary({
  journeys,
  templates
}: TemplateLibraryProps): ReactElement {
  return journeys != null && journeys.length > 0 ? (
    <Container
      sx={{
        pt: 6,
        px: { xs: 0, sm: 8 }
      }}
    >
      {templates != null ? (
        <>
          {templates.map((template) => (
            <TemplateCard key={template.id} journey={template} />
          ))}
        </>
      ) : (
        <>
          {[1, 2, 3].map((index) => (
            <TemplateCard key={`templateCard${index}`} />
          ))}
        </>
      )}
    </Container>
  ) : (
    <Container maxWidth="sm" sx={{ mt: 20 }}>
      <Stack direction="column" spacing={8} alignItems="center">
        <NewReleasesRounded sx={{ fontSize: 60 }} />
        <Typography variant="h1" align="center">
          You need to be invited to create the first template
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
