import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

export function SeeAllVideos(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <Stack sx={{ pt: '54px', alignItems: 'center' }}>
      <Button
        component={NextLink}
        href="/watch/videos"
        locale={false}
        size="small"
        color="secondary"
        variant="outlined"
        sx={{
          whiteSpace: 'nowrap'
        }}
        data-testid="SeeAllVideos"
      >
        {t('See All')}
      </Button>
    </Stack>
  )
}
