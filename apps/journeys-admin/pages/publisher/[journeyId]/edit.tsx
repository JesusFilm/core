import { useQuery } from '@apollo/client'
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

import { GetPublisher } from '../../../__generated__/GetPublisher'
import { Role } from '../../../__generated__/globalTypes'
import { Editor } from '../../../src/components/Editor'
import { EditToolbar } from '../../../src/components/Editor/EditToolbar'
import { JourneyEdit } from '../../../src/components/Editor/JourneyEdit'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { PublisherInvite } from '../../../src/components/PublisherInvite'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { useAdminJourneyQuery } from '../../../src/libs/useAdminJourneyQuery'
import { useInvalidJourneyRedirect } from '../../../src/libs/useInvalidJourneyRedirect'
import { GET_PUBLISHER } from '../[journeyId]'

function TemplateEditPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const user = useUser()
  const { data } = useAdminJourneyQuery({
    id: router.query.journeyId as string
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
              data?.journey?.title != null
                ? t('Edit {{title}}', {
                    title: data.journey.title
                  })
                : t('Edit Template')
            }
            description={data?.journey?.description ?? undefined}
          />
          <Editor
            journey={data?.journey ?? undefined}
            selectedStepId={router.query.stepId as string | undefined}
          >
            <PageWrapper
              title={data?.journey?.title ?? t('Edit Template')}
              showDrawer
              backHref={`/publisher/${router.query.journeyId as string}`}
              user={user}
              menu={<EditToolbar />}
            >
              <JourneyEdit />
            </PageWrapper>
          </Editor>
        </>
      )}
      {data?.journey != null && isPublisher !== true && (
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
})(async ({ user, locale }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { flags, redirect, translations } = await initAndAuthApp({
    user,
    locale
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
