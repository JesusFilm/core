import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { IntegrationType } from '../../../../__generated__/globalTypes'
import { BreadcrumbNavigation } from '../BreadcrumbNavigation'

import { IntegrationsButton } from './IntegrationsButton'

export function Integrations(): ReactElement {
  const router = useRouter()
  return (
    <Paper elevation={0} square sx={{ height: '100%' }}>
      <Container
        maxWidth={false}
        sx={{
          maxWidth: { md: '70vw' },
          px: { xs: 6, sm: 8 },
          py: { xs: 6, sm: 9 }
        }}
      >
        <BreadcrumbNavigation />
        <Stack direction="row" gap={4} sx={{ flexWrap: 'wrap', mt: 10 }}>
          <IntegrationsButton
            url={`/teams/${
              router.query.teamId as string
            }/integrations/new/growth-spaces`}
            type={IntegrationType.growthSpaces}
          />
        </Stack>
      </Container>
    </Paper>
  )
}
