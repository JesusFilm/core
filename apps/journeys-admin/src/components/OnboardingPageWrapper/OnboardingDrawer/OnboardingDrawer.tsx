import Stack from '@mui/material/Stack'
import Image from 'next/image'
import { ReactElement } from 'react'

import logo from '../../../../public/logo.svg'

import { OnboardingStepper } from './OnboardingStepper'
import { OnboardingTemplateCard } from './OnboardingTemplateCard/OnboardingTemplateCard'

export function OnboardingDrawer(): ReactElement {
  return (
    <Stack
      alignItems="center"
      spacing={{ xs: 5, md: 20 }}
      sx={{
        width: { xs: '100%', md: '30%' },
        mt: { xs: 5, md: 10 },
        mb: { xs: 5, md: 0 }
      }}
      data-testid="OnboardingDrawer"
    >
      <Image src={logo} alt="Next Steps" height={26} width={168} />
      <Stack
        alignItems="center"
        gap={{ xs: 5, md: 20 }}
        direction={{ xs: 'column-reverse', md: 'column' }}
        width="100%"
      >
        <OnboardingTemplateCard />
        <OnboardingStepper />
      </Stack>
    </Stack>
  )
}
