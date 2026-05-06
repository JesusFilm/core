'use client'

import { gql, useSuspenseQuery } from '@apollo/client'
import compact from 'lodash/compact'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'

import { GetOnboardingJourneys } from '../../../../__generated__/GetOnboardingJourneys'
import { MediaListItem } from '../../MediaListItem'

export const ONBOARDING_IDS = [
  '014c7add-288b-4f84-ac85-ccefef7a07d3',
  'c4889bb1-49ac-41c9-8fdb-0297afb32cd9',
  'e978adb4-e4d8-42ef-89a9-79811f10b7e9',
  '178c01bd-371c-4e73-a9b8-e2bb95215fd8',
  '13317d05-a805-4b3c-b362-9018971d9b57'
]

export const GET_ONBOARDING_JOURNEYS = gql`
  query GetOnboardingJourneys($where: JourneysFilter) {
    onboardingJourneys: journeys(where: $where) {
      id
      title
      description
      template
      primaryImageBlock {
        src
      }
    }
  }
`

export function OnboardingList(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { data } = useSuspenseQuery<GetOnboardingJourneys>(
    GET_ONBOARDING_JOURNEYS,
    {
      variables: {
        where: {
          ids: ONBOARDING_IDS
        }
      }
    }
  )

  const templates = useMemo(
    () =>
      compact(
        ONBOARDING_IDS.map((onboardingId) =>
          data.onboardingJourneys.find(({ id }) => onboardingId === id)
        )
      ),
    [data]
  )

  return (
    <>
      {templates.map(
        (template) =>
          template != null && (
            <MediaListItem
              title={template.title}
              description={template.description ?? undefined}
              image={template.primaryImageBlock?.src ?? undefined}
              overline={t('Template')}
              key={template.id}
              href={`/templates/${template.id}`}
            />
          )
      )}
    </>
  )
}
