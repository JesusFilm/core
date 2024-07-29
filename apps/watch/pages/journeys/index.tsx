import algoliasearch from 'algoliasearch'

import { GetStaticProps } from 'next'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'
import { InstantSearchServerState } from 'react-instantsearch'
import i18nConfig from '../../next-i18next.config'
import { getFlags } from '../../src/libs/getFlags'

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)

interface JourneysPageProps {
  serverState?: InstantSearchServerState
}

function JourneysPage(
  //  { serverState }: JourneysPageProps
): ReactElement {
  return (
    // <InstantSearchSSRProvider {...serverState}>
    //   <InstantSearch
    //     searchClient={searchClient}
    //     future={{ preserveSharedStateOnUnmount: true }}
    //     insights
    //     routing={{
    //       router: createInstantSearchRouterNext({
    //         serverUrl: 'http://localhost:4300/journeys',
    //         singletonRouter,
    //         routerOptions: {
    //           cleanUrlOnDispose: false
    //         }
    //       })
    //     }}
    //   >
    //     <PageWrapper>
    //       <Box
    //         sx={{ backgroundColor: 'background.default' }}
    //         data-testid="JourneysPage"
    //       >
    //         <Container maxWidth="xxl">
    //           <Stack gap={10}>
    //             <TemplateGallery
    //               algoliaIndex="api-journeys-journeys-dev"
    //               hideOverflow
    //             />
    //           </Stack>
    //         </Container>
    //       </Box>
    //     </PageWrapper>
    //   </InstantSearch>
    // </InstantSearchSSRProvider>
    <>Journeys page</>
  )
}

export const getStaticProps: GetStaticProps<JourneysPageProps> = async ({
  locale
}) => {
  const flags = await getFlags()

  if (flags.journeys !== true)
    return {
      revalidate: 60,
      redirect: '/',
      props: {}
    }

  // const serverState = await getServerState(<JourneysPage />, {
  //   renderToString
  // })
  return {
    revalidate: 60,
    props: {
      flags,
      // serverState,
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export default JourneysPage
