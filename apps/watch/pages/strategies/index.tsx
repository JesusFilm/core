import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { Index } from 'react-instantsearch'
import i18nConfig from '../../next-i18next.config'
import { PageWrapper } from '../../src/components/PageWrapper'
import { StrategySections } from '../../src/components/StrategySections'
import { getFlags } from '../../src/libs/getFlags'

function StrategiesPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <PageWrapper>
      <Box
        sx={{ backgroundColor: 'background.default' }}
        data-testid="StrategiesPage"
      >
        <Container maxWidth="xxl">
          <Index indexName="wp_dev_posts_mission-trip">
            <StrategySections />
          </Index>
        </Container>
      </Box>
    </PageWrapper>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const flags = await getFlags()

  if (flags.strategies !== true)
    return {
      revalidate: 60,
      redirect: '/',
      props: {}
    }

  return {
    revalidate: 3600,
    props: {
      flags,
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export default StrategiesPage
