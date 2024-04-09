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
    <Stack
      data-testid="JourneysAdminOnboardingDrawerTwo"
      alignItems="center"
      sx={{
        // border: '2px blue solid',
        maxWidth: { md: newAccountQuery === true ? 367 : 414 },
        width: 'inherit'
      }}
    >
      <Box
        sx={{
          border: '2px red solid',
          overflow: 'hidden',
          display: {
            xs: 'none',
            md: 'flex'
          }
        }}
      >
        <Image
          src={landingIllustration}
          alt="Landing Illustration"
          width={newAccountQuery === true ? 367 : 414}
          layout="responsive"
          priority
        />
      </Box>

      {newAccountQuery === true && (
        <Box
          sx={{
            // border: '2px green solid',
            pt: { xs: 0, md: 12 },
            pl: 6,
            width: { xs: '100%', md: 291 }
          }}
        >
          <OnboardingStepper variant="desktop" />
        </Box>
      )}

      {newAccountQuery === true && <OnboardingStepper variant="mobile" />}

      {newAccountQuery !== true && (
        <Box
          sx={{
            border: '2px orange solid',
            pt: 25,
            mb: 20,
            width: '100%',
            display: { xs: 'none', md: 'flex' }
          }}
        >
          <Image
            src={landingDescription}
            alt="Landing Description"
            width={404}
            layout="responsive"
            priority
          />
        </Box>
      )}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'center',
          width: '100%',
          py: 1
        }}
      >
        <Box sx={{ width: 552 }}>
          <Image
            src={landingDescriptionMobile}
            alt="Landing Description Mobile"
            layout="responsive"
            priority
          />
        </Box>
      </Box>
    </Stack>
  )
}
