import Stack from '@mui/material/Stack'
import map from 'lodash/map'
import take from 'lodash/take'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { useJourneysQuery } from '../../libs/useJourneysQuery'

import { TemplateSection } from './TemplateSection'

interface Contents {
  [key: string]: { category: string; journeys: Journey[] }
}

interface TemplateSectionsProps {
  tagIds?: string[]
}

export function TemplateSections({
  tagIds
}: TemplateSectionsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [contents, setContents] = useState<Contents>({})
  const [collection, setCollection] = useState<Journey[]>([])
  useJourneysQuery({
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds
      }
    },
    onCompleted(data) {
      const collection =
        tagIds == null
          ? [
              ...data.journeys.filter(({ featuredAt }) => featuredAt != null),
              ...take(
                data.journeys.filter(({ featuredAt }) => featuredAt == null),
                10
              )
            ]
          : data.journeys
      setCollection(collection)
      const contents = {}
      data.journeys.forEach((journey) => {
        journey.tags.forEach((tag) => {
          if (contents[tag.id] == null)
            contents[tag.id] = {
              category: tag.name.find(({ primary }) => primary)?.value ?? '',
              journeys: []
            }
          contents[tag.id].journeys.push(journey)
        })
      })
      setContents(contents)
    }
  })

  return (
    <Stack spacing={8}>
      <TemplateSection
        category={tagIds == null ? t('Featured and New') : t('Most Relevant')}
        journeys={collection}
      />
      {map(
        contents,
        ({ category, journeys }, key) =>
          (tagIds == null || tagIds.includes(key)) && (
            <TemplateSection category={category} journeys={journeys} />
          )
      )}
    </Stack>
  )
}
