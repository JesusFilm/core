import { CombinedGraphQLErrors } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'

import { useCampaignCreateMutation } from '../../../libs/useCampaignCreateMutation'

interface CampaignCreateDialogProps {
  open: boolean
  teamId: string
  onClose: () => void
}

interface CreateValues {
  title: string
}

/**
 * Minimal "name it" dialog. Everything else is edited in the builder, which
 * the dialog navigates to as soon as the draft exists.
 */
export function CampaignCreateDialog({
  open,
  teamId,
  onClose
}: CampaignCreateDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const [campaignCreate] = useCampaignCreateMutation()

  const schema = object({
    title: string()
      .trim()
      .required(t('Title is required'))
      .max(100, t('Max 100 characters'))
  })

  async function handleSubmit(
    values: CreateValues,
    helpers: { setFieldError: (field: string, message: string) => void }
  ): Promise<void> {
    try {
      const { data } = await campaignCreate({
        variables: { input: { teamId, title: values.title.trim() } }
      })
      const created = data?.campaignCreate
      if (created == null) {
        enqueueSnackbar(t("Couldn't create campaign"), {
          variant: 'error',
          preventDuplicate: true
        })
        return
      }
      onClose()
      await router.push(`/campaigns/${created.id}`)
    } catch (error) {
      const fieldError = CombinedGraphQLErrors.is(error)
        ? error.errors.find((e) => typeof e.extensions?.field === 'string')
        : undefined
      if (fieldError != null) {
        helpers.setFieldError('title', fieldError.message)
        return
      }
      enqueueSnackbar(
        error instanceof Error ? error.message : t("Couldn't create campaign"),
        { variant: 'error', preventDuplicate: true }
      )
    }
  }

  return (
    <Formik<CreateValues>
      initialValues={{ title: '' }}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        submitForm,
        isSubmitting,
        resetForm
      }) => (
        <Dialog
          open={open}
          onClose={() => {
            if (isSubmitting) return
            resetForm()
            onClose()
          }}
          loading={isSubmitting}
          dialogTitle={{ title: t('New campaign'), closeButton: true }}
          dialogAction={{
            onSubmit: () => {
              void submitForm()
            },
            submitLabel: t('Create'),
            closeLabel: t('Cancel')
          }}
          testId="CampaignCreateDialog"
        >
          <Form>
            <TextField
              id="title"
              name="title"
              label={t('Campaign title')}
              placeholder={t('e.g. World Cup 2026')}
              fullWidth
              autoFocus
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title === true && Boolean(errors.title)}
              helperText={
                (touched.title === true && errors.title) ||
                t('You can change the title and public link later.')
              }
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}
