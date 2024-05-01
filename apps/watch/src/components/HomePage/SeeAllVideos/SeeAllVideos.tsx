import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

export function SeeAllVideos(): ReactElement {
  const t = useTranslations('apps-watch')
  return (
    <Stack sx={{ pt: '54px', alignItems: 'center' }}>
      <NextLink href="/videos" passHref legacyBehavior>
        <Button
          size="small"
          color="secondary"
          variant="outlined"
          sx={{
            width: '15%',
            whiteSpace: 'nowrap'
          }}
          data-testid="SeeAllVideos"
        >
          {t('See All')}
        </Button>
      </NextLink>
    </Stack>
  )
}
