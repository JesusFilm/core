import { ReactElement } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { PageWrapper } from '../../../src/components/PageWrapper'
import i18nConfig from '../../../next-i18next.config'
import { GetAdminTemplate } from '../../../__generated__/GetAdminTemplate'
import { Editor } from '../../../src/components/Editor'
import { JourneyEdit } from '../../../src/components/Editor/JourneyEdit'
import { GET_ADMIN_TEMPLATE } from '../[journeyId]'

function TemplateEditPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { data } = useQuery<GetAdminTemplate>(GET_ADMIN_TEMPLATE, {
    variables: { id: router.query.journeyId }
  })

  const AuthUser = useAuthUser()

  return (
    <>
      <NextSeo
        title={
          data?.adminTemplate?.title != null
            ? t('Edit {{title}}', { title: data.adminTemplate.template })
            : t('Edit Template')
        }
        description={data?.adminTemplate?.description ?? undefined}
      />
      <Editor
        journey={data?.adminTemplate ?? undefined}
        selectedStepId={router.query.stepId as string | undefined}
      >
        <PageWrapper
          title={data?.adminTemplate?.title ?? t('Edit Tempalte')}
          showDrawer
          backHref={`/templates/${router.query.journeyId as string}`}
          authUser={AuthUser}
        >
          <JourneyEdit />
        </PageWrapper>
      </Editor>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
  const ldUser = {
    key: AuthUser.id as string,
    firstName: AuthUser.displayName ?? undefined,
    email: AuthUser.email ?? undefined
  }
  const launchDarklyClient = await getLaunchDarklyClient(ldUser)
  const flags = (await launchDarklyClient.allFlagsState(ldUser)).toJSON() as {
    [key: string]: boolean | undefined
  }
  return {
    props: {
      flags,
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TemplateEditPage)
