import Paper from '@mui/material/Paper'
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
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            borderRadius: 4,
            width: '100%',
            padding: 8
          }}
        >
          <Typography variant="h6">
            {t('No template fully matches your search criteria.')}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {t(
              "Try using fewer filters or look below for templates related to the categories you've selected to search"
            )}
          </Typography>
        </Paper>
      )}
    </>
  )
}
