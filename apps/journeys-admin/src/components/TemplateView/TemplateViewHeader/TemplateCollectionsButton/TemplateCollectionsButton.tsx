import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { JourneyFields_tags as Tags } from '../../../../../__generated__/JourneyFields'

interface TemplateCollectionsButtonProps {
  tag: Tags
}

export function TemplateCollectionsButton({
  tag
}: TemplateCollectionsButtonProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack direction="row" alignItems="center">
      <Typography
        variant="overline"
        sx={{
          color: 'secondary.light',
          '&:first-of-type': {
            display: { xs: 'none', sm: 'flex' }
          },
          flex: 'none',
          mt: { xs: -2, sm: 0 },
          pl: { xs: '5px', sm: 0 },
          pr: { xs: '3px', sm: 0 }
        }}
        noWrap
      >
        {'\u00B7'}
      </Typography>
      <Button
        size="small"
        variant="text"
        onClick={async () =>
          await router.push({
            pathname: '/templates',
            query: { tagIds: tag?.id }
          })
        }
        sx={{
          color: 'primary.main',
          minWidth: 0,
          p: { xs: 0, sm: 1 },
          mt: { xs: -1, sm: 0 },
          flex: 'none'
        }}
      >
        {t('{{ collectionsName }}', {
          collectionsName: tag?.name[0]?.value
        })}
      </Button>
    </Stack>
  )
}
