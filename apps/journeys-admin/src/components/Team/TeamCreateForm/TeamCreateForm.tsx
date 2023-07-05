import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'
import { Formik, FormikHelpers, FormikConfig } from 'formik'
import { ApolloError } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { useTeamCreateMutation } from '../../../libs/useTeamCreateMutation'
import { TeamCreateInput } from '../../../../__generated__/globalTypes'

interface TeamCreateFormProps {
  onSubmit?: FormikConfig<TeamCreateInput>['onSubmit']
  children?: FormikConfig<TeamCreateInput>['children']
}

export function TeamCreateForm({
  onSubmit,
  children
}: TeamCreateFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const teamSchema = object({
    title: string().required(t('Team Name must be at least one character.'))
  })
  const [teamCreate] = useTeamCreateMutation()
  const { enqueueSnackbar } = useSnackbar()

  async function handleSubmit(
    values: TeamCreateInput,
    helpers: FormikHelpers<TeamCreateInput>
  ): Promise<void> {
    try {
      const { data } = await teamCreate({
        variables: { input: { title: values.title } }
      })
      enqueueSnackbar(
        t('{{ teamName }} created.', {
          teamName: data?.teamCreate.title ?? 'Team'
        }),
        {
          variant: 'success',
          preventDuplicate: true
        }
      )
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            t('Failed to create the team. Reload the page or try again.'),
            {
              variant: 'error',
              preventDuplicate: true
            }
          )
          return
        }
      }
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
    await onSubmit?.(values, helpers)
  }
  const initialValues: TeamCreateInput = { title: '' }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={teamSchema}
    >
      {children}
    </Formik>
  )
}
