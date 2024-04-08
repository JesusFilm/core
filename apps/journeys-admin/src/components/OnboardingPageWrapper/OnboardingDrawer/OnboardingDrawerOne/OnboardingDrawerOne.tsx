import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { OnboardingStepper } from '../OnboardingStepper'
import { OnboardingTemplateCard } from '../OnboardingTemplateCard'

export function OnboardingDrawerOne(): ReactElement {
  const router = useRouter()

  const newAccountQuery =
    router.query.newAccount != null
      ? true
      : router.query.redirect?.includes('newAccount')

  function getTemplateId(): string | undefined {
    const url = router.query.redirect as string | undefined
    if (url == null) return

    const redirect = decodeURIComponent(url)
    const match = redirect.match(/\/templates\/([^/?]+)/)
    if (match != null) {
      return match[1]
    }
  }

  const templateId = getTemplateId()

  return (
    <Stack
      sx={{
        // border: '2px green solid',
        gap: { xs: 0, md: 16 },
        width: { xs: '100%', md: 244 }
      }}
      data-testid="JourneysAdminOnboardingDrawerOne"
    >
      {newAccountQuery === true && <OnboardingStepper variant="mobile" />}

      {templateId != null && (
        <Box
          sx={{
            display: 'flex',
            px: { xs: 6, md: 0 },
            height: { xs: 58, md: '100%' },
            width: { xs: '100%', md: 244 }
          }}
        >
          <OnboardingTemplateCard templateId={templateId} />
        </Box>
      )}

      {newAccountQuery === true && <OnboardingStepper variant="desktop" />}
    </Stack>
  )
}
