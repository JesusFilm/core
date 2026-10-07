import { CombinedGraphQLErrors } from '@apollo/client'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikHelpers } from 'formik'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { object, string } from 'yup'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { useCampaignCreateMutation } from '../../../libs/useCampaignCreateMutation'

const TITLE_MAX_LENGTH = 100

interface CreateCampaignFormValues {
  title: string
  defaultLanguageId: string
}

type CreateCampaignField = keyof CreateCampaignFormValues

/** The API fields a `BAD_USER_INPUT` can name, mapped to the dialog field that shows the message verbatim. */
const FIELD_ERROR_TARGETS: Record<string, CreateCampaignField> = {
  title: 'title',
  slug: 'title',
  defaultLanguageId: 'defaultLanguageId'
}

interface CreateCampaignDialogProps {
  open: boolean
  onClose: () => void
  teamId: string
}

/**
 * Create a campaign from a title and a default language, the only two inputs
 * `campaignCreate` takes; everything else is seeded. On success the new
 * campaign opens in the editor.
 */
export function CreateCampaignDialog({
  open,
  onClose,
  teamId
}: CreateCampaignDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [language, setLanguage] = useState<LanguageOption>()
  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529'
  })
  const [campaignCreate] = useCampaignCreateMutation()

  const schema = object({
    title: string()
      .trim()
      .required(t('Title is required'))
      .max(
        TITLE_MAX_LENGTH,
        t('Max {{count}} characters', { count: TITLE_MAX_LENGTH })
      ),
    defaultLanguageId: string().required(t('Language is required'))
  })

  async function handleSubmit(
    values: CreateCampaignFormValues,
    helpers: FormikHelpers<CreateCampaignFormValues>
  ): Promise<void> {
    try {
      const { data } = await campaignCreate({
        variables: {
          input: {
            teamId,
            title: values.title.trim(),
            defaultLanguageId: values.defaultLanguageId
          }
        }
      })
      const id = data?.campaignCreate.id
      onClose()
      if (id != null) await router.push(`/campaigns/${id}`)
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        const fieldError = error.errors.find(
          (graphQLError) =>
            typeof graphQLError.extensions?.field === 'string' &&
            FIELD_ERROR_TARGETS[graphQLError.extensions.field] != null
        )
        const target =
          fieldError != null
            ? FIELD_ERROR_TARGETS[fieldError.extensions?.field as string]
            : undefined
        if (fieldError != null && target != null) {
          await helpers.setFieldTouched(target, true, false)
          helpers.setFieldError(target, fieldError.message)
          return
        }
      }
      enqueueSnackbar(
        error instanceof Error ? error.message : t('Could not create campaign'),
        { variant: 'error', preventDuplicate: true }
      )
    }
  }

  return (
    <Formik<CreateCampaignFormValues>
      initialValues={{ title: '', defaultLanguageId: '' }}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        setFieldTouched,
        submitForm,
        isSubmitting
      }) => (
        <Dialog
          open={open}
          onClose={isSubmitting ? undefined : onClose}
          dialogTitle={{ title: t('Create campaign'), closeButton: true }}
          dialogAction={{
            onSubmit: () => {
              void submitForm()
            },
            submitLabel: t('Create'),
            closeLabel: t('Cancel')
          }}
          loading={isSubmitting}
          testId="CreateCampaignDialog"
        >
          <Form>
            <Stack spacing={4} sx={{ pt: 1 }}>
              <TextField
                name="title"
                label={t('Title')}
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title === true && Boolean(errors.title)}
                helperText={
                  touched.title === true && errors.title != null
                    ? errors.title
                    : t(
                        'Shown as the page title. The address is generated from it.'
                      )
                }
                fullWidth
                autoFocus
                slotProps={{ htmlInput: { 'aria-label': t('Title') } }}
              />
              <LanguageAutocomplete
                value={language}
                languages={languagesData?.languages}
                loading={languagesLoading}
                onChange={(option) => {
                  setLanguage(option)
                  void setFieldValue('defaultLanguageId', option?.id ?? '')
                  void setFieldTouched('defaultLanguageId', true, false)
                }}
                error={
                  touched.defaultLanguageId === true &&
                  Boolean(errors.defaultLanguageId)
                }
                helperText={
                  touched.defaultLanguageId === true &&
                  errors.defaultLanguageId != null
                    ? errors.defaultLanguageId
                    : t('The default language of every text on the campaign.')
                }
              />
            </Stack>
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}
