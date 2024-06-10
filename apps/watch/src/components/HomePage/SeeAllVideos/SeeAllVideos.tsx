import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

export function SeeAllVideos(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <Stack sx={{ pt: '54px', alignItems: 'center' }}>
      <NextLink href="/watch/videos" passHref legacyBehavior>
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
