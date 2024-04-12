import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { useTranslation } from '../../../libs/il8n/client'

interface SeeAllVideosProps {
  languageId: string
}
export function SeeAllVideos({ languageId }: SeeAllVideosProps): ReactElement {
  const { t } = useTranslation(languageId, 'apps-watch')
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
