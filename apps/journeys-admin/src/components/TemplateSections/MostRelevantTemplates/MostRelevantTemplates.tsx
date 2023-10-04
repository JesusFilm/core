import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourneysQuery } from '../../../libs/useJourneysQuery'
import { TemplateSection } from '../TemplateSection'

export function MostRelevantTemplates(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  // update to be taking in tags from parent component
  const router = useRouter()
  const tags = router.query.tags as string[]

  const { data } = useJourneysQuery({
    where: { template: true, orderByRecent: true, tagIds: tags }
  })

  return (
    <>
      {data != null && data?.journeys?.length > 0 ? (
        <TemplateSection
          category={t('Most Relevant')}
          journeys={data?.journeys}
        />
      ) : (
        <Stack
          gap={3}
          sx={{
            borderRadius: 4,
            border: 1,
            width: '100%',
            height: 132,
            padding: 8,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h6">
            {t('No template that fully matches your search criteria.')}
          </Typography>
          <Typography variant="body1">
            {t(
              "Try using fewer filters or look below for templates related to the categories you've selected to search"
            )}
          </Typography>
        </Stack>
      )}
    </>
  )
}
