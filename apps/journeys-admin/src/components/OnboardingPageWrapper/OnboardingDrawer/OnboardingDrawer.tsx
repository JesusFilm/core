import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

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
      gap={5}
      sx={{
        py: { md: 10 },
        width: { xs: '100%', md: '30%' }
      }}
      data-testid="JourneysAdminOnboardingDrawer"
    >
      <Box sx={{ height: 26, width: { xs: 148, md: 195 } }}>
        <Image src={logo} alt="Next Steps" layout="responsive" />
      </Box>
      {templateId == null && (
        <Box
          sx={{
            p: 5,
            overflow: 'hidden',
            aspectRatio: '0.9/1',
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
        <Box
          sx={{
            py: { xs: 3, md: 0 },
            display: {
              xs: 'block',
              md: newAccountQuery === true ? 'none' : 'block'
            }
          }}
        >
          <Image
            src={landingDescription}
            alt="Landing Description"
            layout="responsive"
          />
        </Box>
      )}
      <OnboardingTemplateCard templateId={templateId} />
      {newAccountQuery === true && <OnboardingStepper variant="desktop" />}
    </Stack>
  )
}
