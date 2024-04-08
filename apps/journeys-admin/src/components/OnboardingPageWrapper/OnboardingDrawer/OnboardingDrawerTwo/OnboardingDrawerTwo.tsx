import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import landingDescriptionMobile from '../../../../../public/landing-description-mobile.png'
import landingDescription from '../../../../../public/landing-description.png'
import landingIllustration from '../../../../../public/landing-illustration.png'
import { OnboardingStepper } from '../OnboardingStepper'

export function OnboardingDrawerTwo(): ReactElement {
  const router = useRouter()

  const newAccountQuery =
    router.query.newAccount != null
      ? true
      : router.query.redirect?.includes('newAccount')

  return (
    <Stack data-testid="JourneysAdminOnboardingDrawerTwo">
      <Box
        sx={{
          overflow: 'hidden',
          height: 444,
          display: { xs: 'none', md: 'flex' }
        }}
      >
        <Image
          src={landingIllustration}
          alt="Landing Illustration"
          layout="responsive"
          priority
        />
      </Box>

      {newAccountQuery === true && <OnboardingStepper variant="mobile" />}

      <>
        {newAccountQuery !== true && (
          <Box
            sx={{
              mb: 20,
              width: 600,
              display: { xs: 'none', md: 'block' }
            }}
          >
            <Image
              src={landingDescription}
              alt="Landing Description"
              layout="responsive"
              priority
            />
          </Box>
        )}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Image
            src={landingDescriptionMobile}
            alt="Landing Description Mobile"
            layout="responsive"
            priority
          />
        </Box>
      </>

      {newAccountQuery === true && <OnboardingStepper variant="desktop" />}
    </Stack>
  )
}
