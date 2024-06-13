import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { ReactElement } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { TemplateGallery } from '@core/journeys/ui/TemplateGallery'
import { Stack } from '@mui/system'
import { PageWrapper } from '../../src/components/PageWrapper'

export function JourneysPage(): ReactElement {
  return (
    <PageWrapper>
      <Box
        sx={{ backgroundColor: 'background.default', overflow: 'hidden' }}
        data-testid="JourneysPage"
      >
        <Container maxWidth="xxl" sx={{ paddingY: '4rem' }}>
          <Stack gap={10}>
            <ThemeProvider
              themeName={ThemeName.journeysAdmin}
              themeMode={ThemeMode.light}
              nested
            >
              <TemplateGallery />
            </ThemeProvider>
          </Stack>
        </Container>
      </Box>
    </PageWrapper>
  )
}
export default JourneysPage
