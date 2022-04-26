import { ReactElement } from 'react'
import { useQuery } from '@apollo/client'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { GetJourney } from '../../../__generated__/GetJourney'
import { Editor } from '../../../src/components/Editor'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { GET_JOURNEY } from '../[journeySlug]'
import { JourneyEdit } from '../../../src/components/Editor/JourneyEdit'
import { EditToolbar } from '../../../src/components/Editor/EditToolbar'
import { JourneyInvite } from '../../../src/components/JourneyInvite/JourneyInvite'

function JourneyEditPage(): ReactElement {
  const router = useRouter()
  const AuthUser = useAuthUser()
  const { data, error } = useQuery<GetJourney>(GET_JOURNEY, {
    variables: { id: router.query.journeySlug }
  })

  return (
    <>
      {error == null && (
        <>
          <NextSeo
            title={`Edit ${data?.journey?.title ?? 'Journey'}`}
            description={data?.journey?.description ?? undefined}
          />
          <Editor
            journey={data?.journey ?? undefined}
            selectedStepId={router.query.stepId as string | undefined}
          >
            <PageWrapper
              title={data?.journey?.title ?? 'Edit Journey'}
              showDrawer
              backHref={`/journeys/${router.query.journeySlug as string}`}
              menu={<EditToolbar />}
              authUser={AuthUser}
            >
              <JourneyEdit />
            </PageWrapper>
          </Editor>
        </>
      )}
      {error?.graphQLErrors[0].message ===
        'User has not received an invitation to edit this journey.' && (
        <>
          <NextSeo title="Access Denied" />
          <JourneyInvite journeySlug={router.query.journeySlug as string} />
        </>
      )}
      {error?.graphQLErrors[0].message === 'User invitation pending.' && (
        <>
          <NextSeo title="Access Denied" />
          <JourneyInvite
            journeySlug={router.query.journeySlug as string}
            requestReceived
          />
        </>
      )}
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async () => {
  return {
    props: {}
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyEditPage)
