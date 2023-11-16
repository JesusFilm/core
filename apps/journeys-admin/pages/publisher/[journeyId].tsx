import { gql, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

import { GetPublisher } from '../../__generated__/GetPublisher'
import { GetPublisherTemplate } from '../../__generated__/GetPublisherTemplate'
import { Role } from '../../__generated__/globalTypes'
import { Editor } from '../../src/components/Editor'
import { EditToolbar } from '../../src/components/Editor/EditToolbar'
import { JourneyEdit } from '../../src/components/Editor/JourneyEdit'
import { PageWrapper } from '../../src/components/PageWrapper'
import { PublisherInvite } from '../../src/components/PublisherInvite'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useInvalidJourneyRedirect } from '../../src/libs/useInvalidJourneyRedirect'

export const GET_PUBLISHER_TEMPLATE = gql`
  ${JOURNEY_FIELDS}
  query GetPublisherTemplate($id: ID!) {
    publisherTemplate: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`

export const GET_PUBLISHER = gql`
  query GetPublisher {
    getUserRole {
      id
      roles
    }
  }
`

function TemplateEditPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const user = useUser()
  const { data } = useQuery<GetPublisherTemplate>(GET_PUBLISHER_TEMPLATE, {
    variables: { id: router.query.journeyId }
  })
  const { data: publisherData } = useQuery<GetPublisher>(GET_PUBLISHER)
  const isPublisher = publisherData?.getUserRole?.roles?.includes(
    Role.publisher
  )

  useInvalidJourneyRedirect(data)
  return (
    <>
      {isPublisher === true && (
        <>
          <NextSeo
            title={
              data?.publisherTemplate?.title != null
                ? t('Edit {{title}}', { title: data.publisherTemplate.title })
                : t('Edit Journey')
            }
            description={data?.publisherTemplate?.description ?? undefined}
          />
          <Editor
            journey={data?.publisherTemplate ?? undefined}
            selectedStepId={router.query.stepId as string | undefined}
          >
            <PageWrapper
              title={data?.publisherTemplate?.title ?? t('Edit Template')}
              showDrawer
              user={user}
              backHref="/publisher"
              menu={<EditToolbar />}
            >
              <JourneyEdit />
            </PageWrapper>
          </Editor>
        </>
      )}
      {data?.publisherTemplate != null && isPublisher !== true && (
        <>
          <NextSeo title={t('Access Denied')} />
          <PublisherInvite />
        </>
      )}
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { flags, redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      flags,
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TemplateEditPage)
