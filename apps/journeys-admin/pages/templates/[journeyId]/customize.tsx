import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'

import { MultiStepForm } from '../../../src/components/TemplateCustomization/MultiStepForm'

function CustomizePage({ journeyId }) {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <NextSeo title={t('Customize Template')} />
      <MultiStepForm />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  return {
    props: {
      journeyId: params?.journeyId
    }
  }
}

export default CustomizePage
