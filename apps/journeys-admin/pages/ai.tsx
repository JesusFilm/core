import { gql, useLazyQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import noop from 'lodash/noop'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, SetStateAction, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { TemplateCardPreview } from '@core/journeys/ui/TemplateView/TemplatePreviewTabs/TemplateCardPreview/TemplateCardPreview'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../__generated__/GetJourney'
import { initAndAuthApp } from '../src/libs/initAndAuthApp'

export const GET_GENERATED_JOURNEY = gql`
  query GetGeneratedJourney($userInput: String!) {
    generateJourney(userInput: $userInput)
  }
`

function AiPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [steps, setSteps] = useState<Array<TreeBlock<StepBlock>>>([])

  const [getGenerateJourney, { loading, error, data }] = useLazyQuery(
    GET_GENERATED_JOURNEY
  )

  async function handleGenerateJourney(values: FormikValues) {
    const { data } = await getGenerateJourney({
      variables: { userInput: values.userInput },
      onCompleted: (data) => {
        console.log('data:', data)
        const parsedData = JSON.parse(data.generateJourney)
        console.log('parsedData.blocks: ', parsedData['blocks'])
        setSteps(parsedData['blocks'])
      }
    })
    console.log('steps: ', steps)
  }

  return (
    <Stack>
      <Formik
        initialValues={{ userInput: '' }}
        onSubmit={handleGenerateJourney}
        validateOnChange={false}
        validateOnBlur={false}
        validateOnMount={false}
      >
        {({ values, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <TextField
              value={values.userInput}
              onChange={handleChange}
              name="userInput"
              label={t('Enter your prompt here')}
              multiline
              minRows={5}
              maxRows={20}
            />

            <Button type="submit"> {t('Generate Journey')}</Button>
          </Form>
        )}
      </Formik>
      {loading && <Box>Loading...</Box>}
      {steps.length > 0 && (
        <TemplateCardPreview
          steps={steps}
          openTeamDialog={false}
          setOpenTeamDialog={function (value: SetStateAction<boolean>): void {
            throw new Error('Function not implemented.')
          }}
        />
      )}
    </Stack>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl, query }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, redirect, translations, flags } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      ...translations,
      flags
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(AiPage)
