import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import landingDescriptionMobile from '../../../../public/landing-description-mobile.png'
import landingDescription from '../../../../public/landing-description.png'
import landingIllustration from '../../../../public/landing-illustration.png'
import logo from '../../../../public/logo.svg'

import { OnboardingStepper } from './OnboardingStepper'
import { OnboardingTemplateCard } from './OnboardingTemplateCard/OnboardingTemplateCard'

export function OnboardingDrawer(): ReactElement {
  const router = useRouter()

  const newAccountQuery =
    router.query.newAccount != null
      ? true
      : router.query.redirect?.includes('newAccount')

  function getTemplateId(): string | undefined {
    const url = router.query.redirect as string | undefined
    if (url == null) return

    const redirect = decodeURIComponent(url)
    const pathnameParts = redirect?.split('/')
    if (redirect?.includes('templates') && pathnameParts != null) {
      const idIndex = pathnameParts.indexOf('templates') + 1
      const id = pathnameParts[idIndex]
      return id.split('?')[0]
    }
  }

  const templateId = getTemplateId()

  return (
    <Stack
      alignItems="center"
      justifyContent="space-between"
      gap={{ xs: 4, md: templateId == null ? 10 : 0 }}
      sx={{
        mt: { xs: 5 },
        my: { md: 10 },
        mx: { md: 20 },
        width: { xs: '100%', md: '37%' },
        mb: { xs: templateId == null || newAccountQuery === true ? 0 : 5 }
      }}
      data-testid="JourneysAdminOnboardingDrawer"
    >
      <Box sx={{ height: 26, width: { xs: 148, md: 195 } }}>
        <Image src={logo} alt="Next Steps" layout="responsive" />
      </Box>

      {templateId == null && (
        <Box
          sx={{
            pt: 10,
            overflow: 'hidden',
            aspectRatio: '1180/1340.16',
            flexGrow: 1,
            display: { xs: 'none', md: 'flex' }
          }}
        >
          <Image
            src={landingIllustration}
            alt="Landing Illustration"
            layout="responsive"
          />
        </Box>
      )}

      {newAccountQuery === true && <OnboardingStepper variant="mobile" />}

      {templateId == null && (
        <>
          {newAccountQuery === false && (
            <Box
              sx={{
                width: 600,
                py: { xs: 3, md: 0 },
                display: { xs: 'none', md: 'block' }
              }}
            >
              <Image
                src={landingDescription}
                alt="Landing Description"
                layout="responsive"
              />
            </Box>
          )}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Image
              src={landingDescriptionMobile}
              alt="Landing Description Mobile"
              layout="responsive"
            />
          </Box>
        </>
      )}

      {templateId != null && <OnboardingTemplateCard templateId={templateId} />}

      {newAccountQuery === true && <OnboardingStepper variant="desktop" />}
    </Stack>
  )
}
