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
import { object, string } from 'yup'

import { TreeBlock } from '@core/journeys/ui/block'
import { transformer } from '@core/journeys/ui/transformer'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import i18nConfig from '../../../next-i18next.config'
import { Conductor } from '../../../src/components/Conductor'

export const GENERATE_JOURNEY = gql`
  query GenerateJourney($input: JourneyGenerationInput!) {
    generateJourney(input: $input)
  }
`

const validationSchema = object({
  theme: string().required('Theme is required'),
  targetAudience: string().required('Target audience is required'),
  mainMessage: string().required('Main message is required'),
  language: string().default('529'),
  additionalContext: string(),
  systemPrompt: string()
})

function AiPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [steps, setSteps] = useState<Array<TreeBlock<StepBlock>> | null>(null)

  const [generateJourney, { loading }] = useLazyQuery(GENERATE_JOURNEY)

  async function handleGenerateJourney(values: FormikValues) {
    // const blocksWithTypename = j.blocks.map((block) => ({
    //   ...block,
    //   __typename: block.typename
    // }))
    // const transformedSteps = transformer(
    //   blocksWithTypename as unknown as any
    // ) as TreeBlock<StepBlock>[]
    // setSteps(transformedSteps)
    const { data } = await generateJourney({
      variables: {
        input: {
          theme: values.theme,
          targetAudience: values.targetAudience,
          mainMessage: values.mainMessage,
          language: values.language,
          additionalContext: values.additionalContext,
          systemPrompt: values.systemPrompt
        }
      },
      onCompleted: (data) => {
        if (data.generateJourney == null) return
        const parsedData = JSON.parse(data.generateJourney)
        console.log('parsedData', parsedData)
        const blocksWithTypename = parsedData.blocks.map((block) => ({
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

  console.log('steps', steps)

  return (
    <Stack spacing={4} sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>
      <Formik
        initialValues={{
          theme: '',
          targetAudience: '',
          mainMessage: '',
          language: '529',
          additionalContext: '',
          systemPrompt: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleGenerateJourney}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <Form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                value={values.theme}
                onChange={handleChange}
                name="theme"
                label={t('Theme')}
                error={touched.theme && Boolean(errors.theme)}
                helperText={touched.theme && (errors.theme as string)}
              />
              <TextField
                fullWidth
                value={values.targetAudience}
                onChange={handleChange}
                name="targetAudience"
                label={t('Target Audience')}
                error={touched.targetAudience && Boolean(errors.targetAudience)}
                helperText={
                  touched.targetAudience && (errors.targetAudience as string)
                }
              />
              <TextField
                fullWidth
                value={values.mainMessage}
                onChange={handleChange}
                name="mainMessage"
                label={t('Main Message')}
                multiline
                rows={3}
                error={touched.mainMessage && Boolean(errors.mainMessage)}
                helperText={
                  touched.mainMessage && (errors.mainMessage as string)
                }
              />
              <TextField
                fullWidth
                value={values.additionalContext}
                onChange={handleChange}
                name="additionalContext"
                label={t('Additional Context (Optional)')}
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                value={values.systemPrompt}
                onChange={handleChange}
                name="systemPrompt"
                label={t('System Prompt (Optional)')}
                multiline
                rows={3}
              />
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  t('Generate Journey')
                )}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {steps != null && steps?.length > 0 && (
        <Box sx={{ width: '100%', height: '100%', mt: 4 }}>
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
