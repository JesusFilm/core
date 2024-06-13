import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import logo from '../../../../public/logo.svg'

import { OnboardingLandingDrawer } from './OnboardingLandingDrawer'
import { OnboardingStepper } from './OnboardingStepper'
import { OnboardingTemplateCard } from './OnboardingTemplateCard'

export function OnboardingDrawer(): ReactElement {
  const router = useRouter()

  const newAccountQuery =
    router.query.newAccount != null
      ? true
      : router.query.redirect?.includes('newAccount')

  function getTemplateId(): string | undefined {
    const url = router.query.redirect as string
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
      alignItems="center"
      sx={{
        mt: { xs: 4, sm: 10, md: 4 },
        my: { md: 10 },
        mx: { md: 20 },
        width: { xs: '100%', md: '32%' },
        mb: { xs: templateId == null ? 0 : 3 },
        overflowY: { xs: 'none', md: 'auto' }
      }}
      data-testid="JourneysAdminOnboardingDrawer"
    >
      <Stack
        sx={{
          height: { xs: 46, md: 48 },
          width: { xs: 185, md: 291 },
          px: { xs: 4, md: 6 },
          pt: { xs: 2, md: 0 },
          pb: { xs: 2, md: 3 }
        }}
      >
        <Box
          sx={{
            width: { xs: 148, md: 195 },
            height: { xs: 28, md: 36 }
          }}
        >
          <Image src={logo} alt="Next Steps" layout="responsive" />
        </Box>
      </Stack>
      {templateId != null ? (
        <Stack
          justifyContent="center"
          sx={{
            pt: { xs: 4, md: 15 },
            width: { xs: '100%', md: 244 }
          }}
        >
          <Stack
            sx={{
              gap: { xs: 2, md: 16 },
              width: 'inherit'
            }}
          >
            {newAccountQuery === true && <OnboardingStepper variant="mobile" />}

            {templateId != null && (
              <Stack
                flexDirection="column"
                justifyContent="center"
                sx={{
                  px: { xs: 6, md: 0 },
                  py: { xs: 2, md: 0 },
                  height: { xs: 78, md: 352 },
                  width: { xs: '100%', md: 244 }
                }}
              >
                <OnboardingTemplateCard templateId={templateId} />
              </Stack>
            )}
            {newAccountQuery === true && (
              <Box sx={{ pl: 4 }}>
                <OnboardingStepper variant="desktop" />
              </Box>
            )}
          </Stack>
        </Stack>
      ) : (
        <OnboardingLandingDrawer
          templateId={templateId}
          newAccountQuery={newAccountQuery}
        />
      )}
    </Stack>
  )
}
