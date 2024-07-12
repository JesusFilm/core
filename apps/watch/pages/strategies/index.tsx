import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import { Box } from '@mui/material'
import i18nConfig from '../../next-i18next.config'
import { PageWrapper } from '../../src/components/PageWrapper'
import { StrategySection } from '../../src/components/StrategySection'
import { getFlags } from '../../src/libs/getFlags'

function StrategiesPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <PageWrapper>
      <Box sx={{ height: 50 }} />
      <StrategySection
        title="Training Strategies"
        description="Training Strategies Description"
      />
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
