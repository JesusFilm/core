import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import logo from '../../../../public/logo.svg'

import { OnboardingDrawerOne } from './OnboardingDrawerOne'
import { OnboardingDrawerTwo } from './OnboardingDrawerTwo'

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
    const match = redirect.match(/\/templates\/([^/?]+)/)
    if (match != null) {
      return match[1]
    }
  }

  const templateId = getTemplateId()

  console.log('templateId', templateId)

  return (
    <Stack
      alignItems="center"
      sx={{
        border: '2px blue solid',
        mt: { xs: 4 },
        my: { md: 10 },
        mx: { md: 20 },
        width: { xs: '100%', md: '32%' },
        mb: { xs: templateId == null ? 0 : 3 },
        overflow: 'scroll'
      }}
      data-testid="JourneysAdminOnboardingDrawer"
    >
      <Stack
        sx={{
          // border: '2px blue solid',
          // alignItems: { xs: 'center', md: 'flex-start' },
          height: { xs: 46, md: 48 },
          width: { xs: 185, md: 291 },
          px: { xs: 4, md: 6 },
          pt: { xs: 2, md: 0 },
          pb: { xs: 2, md: 3 }
        }}
      >
        <Box
          sx={{
            border: '2px red solid',
            width: { xs: 148, md: 195 },
            height: { xs: 28, md: 36 }
          }}
        >
          <Image src={logo} alt="Next Steps" layout="responsive" />
        </Box>
      </Stack>
      {templateId !== undefined ? (
        <Stack
          justifyContent="center"
          sx={{
            border: '2px green solid',
            pt: { xs: templateId == null ? 2 : 4, md: 15 },
            width: { xs: '100%', md: 244 }
          }}
        >
          <OnboardingDrawerOne />
        </Stack>
      ) : (
        <Stack
          flexDirection="row"
          justifyContent="center"
          sx={{
            border: '2px green solid',
            pt: {
              xs: templateId == null ? 4 : 4,
              md: newAccountQuery === true ? 10 : 26
            },
            width: { xs: '100%' }
          }}
        >
          <OnboardingDrawerTwo />
        </Stack>
      )}
    </Stack>
  )
}
