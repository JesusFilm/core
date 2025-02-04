import { gql, useLazyQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import { GetStaticProps } from 'next/types'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { transformer } from '@core/journeys/ui/transformer'

import {
  GetGeneratedJourney,
  GetGeneratedJourneyVariables
} from '../../../__generated__/GetGeneratedJourney'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import i18nConfig from '../../../next-i18next.config'
import { Conductor } from '../../../src/components/Conductor'

export const GET_GENERATED_JOURNEY = gql`
  query GetGeneratedJourney($prompt: String!, $system: String!) {
    generateJourney(prompt: $prompt, system: $system)
  }
`

function AiPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [steps, setSteps] = useState<Array<TreeBlock<StepBlock>> | null>(null)

  const [getGenerateJourney, { loading }] = useLazyQuery<
    GetGeneratedJourney,
    GetGeneratedJourneyVariables
  >(GET_GENERATED_JOURNEY)

  async function handleGenerateJourney(values: FormikValues) {
    const { data } = await getGenerateJourney({
      variables: { prompt: values.prompt, system: values.system },
      onCompleted: (data) => {
        if (data.generateJourney == null) return
        const parsedResponse = JSON.parse(data.generateJourney)
        const parsedData = JSON.parse(parsedResponse)

        const blocksWithTypename = parsedData['blocks'].map((block) => ({
          ...block,
          __typename: block.typename
        }))

        const transformedSteps = transformer(
          blocksWithTypename
        ) as TreeBlock<StepBlock>[]

        console.log('transformedSteps', transformedSteps)

        setSteps(transformedSteps)
      }
    })
  }
  console.log('steps: ', steps)

  return (
    <Stack>
      <Formik
        initialValues={{ prompt: '', system: '' }}
        onSubmit={handleGenerateJourney}
        validateOnChange={false}
        validateOnBlur={false}
        validateOnMount={false}
      >
        {({ values, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <TextField
              value={values.prompt}
              onChange={handleChange}
              name="prompt"
              label={t('Enter your prompt here')}
              multiline
              minRows={5}
              maxRows={20}
            />
            <TextField
              value={values.system}
              onChange={handleChange}
              name="system"
              label={t('Enter your system prompt here')}
              multiline
              minRows={5}
              maxRows={20}
            />
            <Button type="submit"> {t('Generate Journey')}</Button>
          </Form>
        )}
      </Formik>
      {loading && (
        <Box>
          <CircularProgress />
        </Box>
      )}
      {steps != null && steps?.length > 0 && (
        <Box sx={{ width: '100%', height: '100%' }}>
          <Conductor blocks={steps} />
        </Box>
      )}
    </Stack>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(
        context.locale ?? 'en',
        ['apps-journeys', 'libs-journeys-ui'],
        i18nConfig
      ))
    },
    revalidate: 60
  }
}

export default AiPage
