import Stack from '@mui/material/Stack'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import logo from '../../../../public/logo.svg'
import { useJourneyQuery } from '../../../libs/useJourneyQuery'
import { OnboardingTemplateCard } from '../OnboardingTemplateCard/OnboardingTemplateCard'

export function OnboardingSideBar(): ReactElement {
  const router = useRouter()

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

  const { data } = useJourneyQuery({ id: templateId ?? '' })

  return (
    <Stack
      alignItems="center"
      spacing={20}
      sx={{
        height: '100%',
        width: '30%',
        mt: 20
      }}
    >
      <Image src={logo} alt="Next Steps" height={41} width={208} />
      {data != null && <OnboardingTemplateCard journey={data.journey} />}
    </Stack>
  )
}
