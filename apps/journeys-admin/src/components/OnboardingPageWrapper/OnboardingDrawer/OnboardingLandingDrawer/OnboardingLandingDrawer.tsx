import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import { ReactElement } from 'react'

import landingDescriptionMobile from '../../../../../public/landing-description-mobile.png'
import landingDescription from '../../../../../public/landing-description.png'
import landingIllustration from '../../../../../public/landing-illustration.png'
import { OnboardingStepper } from '../OnboardingStepper'

interface OnboardingLandingDrawerProps {
  templateId: string | undefined
  newAccountQuery: boolean | undefined
}

export function OnboardingLandingDrawer({
  templateId,
  newAccountQuery
}: OnboardingLandingDrawerProps): ReactElement {
  return (
    <Stack
      flexDirection="row"
      justifyContent="center"
      sx={{
        pt: {
          xs: templateId == null ? 4 : 4,
          md: newAccountQuery === true ? 10 : 26
        },
        width: { xs: '100%' }
      }}
    >
      <Stack
        data-testid="JourneysAdminOnboardingLandingDrawer"
        alignItems="center"
        sx={{
          maxWidth: { md: newAccountQuery === true ? 367 : 414 },
          width: 'inherit'
        }}
      >
        <Box
          sx={{
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
              pt: 25,
              mb: 0,
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
    </Stack>
  )
}
