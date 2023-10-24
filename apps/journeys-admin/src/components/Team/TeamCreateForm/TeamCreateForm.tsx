import { ApolloError } from '@apollo/client'
import { Formik, FormikConfig, FormikHelpers } from 'formik'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { ObjectSchema, object, string } from 'yup'

import { TeamCreateInput } from '../../../../__generated__/globalTypes'
import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { useTeamCreateMutation } from '../../../libs/useTeamCreateMutation'

interface TeamCreateFormProps {
  onSubmit?: (
    values: TeamCreateInput,
    formikHelpers: FormikHelpers<TeamCreateInput>,
    data?: TeamCreate | null
  ) => void
  children?: FormikConfig<TeamCreateInput>['children']
}

export function TeamCreateForm({
  onSubmit,
  children
}: TeamCreateFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const teamCreateSchema: ObjectSchema<TeamCreateInput> = object({
    title: string()
      .required(t('Team Name must be at least one character.'))
      .max(40, t('Max {{ count }} Characters', { count: 40 }))
      .matches(/^(?!\s+$).*/g, 'This field cannot contain only blankspaces'),
    publicTitle: string().max(
      40,
      t('Max {{ count }} Characters', { count: 40 })
    )
  })
  const [teamCreate] = useTeamCreateMutation()
  const { enqueueSnackbar } = useSnackbar()

  async function handleSubmit(
    input: TeamCreateInput,
    helpers: FormikHelpers<TeamCreateInput>
  ): Promise<void> {
    try {
      const { data } = await teamCreate({
        variables: { input }
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
      await onSubmit?.(input, helpers, data)
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
  }
  const initialValues: TeamCreateInput = { title: '' }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={teamCreateSchema}
    >
      {children}
    </Formik>
  )
}
