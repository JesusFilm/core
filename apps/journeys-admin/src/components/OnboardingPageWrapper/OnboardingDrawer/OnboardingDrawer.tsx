import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Image, { StaticImageData } from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import landingDescription from '../../../../public/landing-description.png'
import landingIllustration from '../../../../public/landing-illustration.png'
import logo from '../../../../public/logo.svg'

import { OnboardingStepper } from './OnboardingStepper'
import { OnboardingTemplateCard } from './OnboardingTemplateCard/OnboardingTemplateCard'

export function OnboardingDrawer(): ReactElement {
  const router = useRouter()

  const onboarding =
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
      gap={{ xs: onboarding === true ? 4 : 0, md: 10 }}
      sx={{
        width: { xs: '100%', md: '30%' },
        mt: { xs: 5, md: 10 }
      }}
      data-testid="OnboardingDrawer"
    >
      <ResponsiveImage
        src={logo}
        alt="Next Steps"
        sx={{ height: 26, width: { xs: 148, md: 195 } }}
      />
      {templateId == null && (
        <ResponsiveImage
          src={landingIllustration}
          alt="Landing Illustration"
          sx={{
            px: { md: 10, lg: 15 },
            display: { xs: 'none', md: 'block' }
          }}
        />
      )}
      {onboarding === true && <OnboardingStepper variant="mobile" />}
      {templateId == null && (
        <ResponsiveImage
          src={landingDescription}
          alt="Landing Description"
          sx={{
            py: { xs: 3, md: 0 },
            display: {
              xs: 'block',
              md: onboarding === true ? 'none' : 'block'
            }
          }}
        />
      )}
      <OnboardingTemplateCard templateId={templateId} />
      {onboarding === true && <OnboardingStepper variant="desktop" />}
    </Stack>
  )
}

interface ResponsiveImageProps {
  src: StaticImageData
  alt?: string
  sx?: SxProps
}

function ResponsiveImage({ src, alt, sx }: ResponsiveImageProps): ReactElement {
  return (
    <Box sx={{ width: '100%', height: 'auto', ...sx }}>
      <Image src={src} alt={alt ?? 'landing-page-image'} layout="responsive" />
    </Box>
  )
}
