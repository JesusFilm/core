import { ApolloError, useMutation } from '@apollo/client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'

import { JourneyCustomizationDescriptionUpdate } from '../../../../../../__generated__/JourneyCustomizationDescriptionUpdate'
import { useTitleDescLanguageUpdateMutation } from '../../../../../libs/useTitleDescLanguageUpdateMutation'
import { CustomizeTemplate } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/AboutTabPanel/CustomizeTemplate'
import { MetadataTabPanel } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/MetadataTabPanel'
import { JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/TemplateSettingsDialog'
import { TemplateSettingsFormValues } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/useTemplateSettingsForm'
import { formatTemplateCustomizationString } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/utils/formatTemplateCustomizationString'
import { getTemplateCustomizationFields } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/utils/getTemplateCustomizationFields'

interface LocalTemplateDetailsDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * LocalTemplateDetailsDialog — single unified editor for LOCAL templates only
 * (journey.template === true && journey.team.id !== 'jfp-team').
 *
 * Replaces the pair of "Edit Details" (JourneyDetailsDialog) and
 * "Template Settings" (TemplateSettingsDialog) dialogs for local templates.
 * Global templates continue to use {@link TemplateSettingsDialog} unchanged.
 *
 * Submit routes by dirty subset:
 * - title / description / languageId → useTitleDescLanguageUpdateMutation
 *   (preserves the subscription path + `updatedAt` consumed by translation polling)
 * - journeyCustomizationDescription → journeyCustomizationFieldPublisherUpdate
 */
export function LocalTemplateDetailsDialog({
  open,
  onClose
}: LocalTemplateDetailsDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey } = useJourney()
  const [titleDescLanguageUpdate] = useTitleDescLanguageUpdateMutation()
  const [journeyCustomizationDescriptionUpdate] =
    useMutation<JourneyCustomizationDescriptionUpdate>(
      JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE
    )
  const { enqueueSnackbar } = useSnackbar()

  const validationSchema = object({
    title: string().trim().required(t('Required'))
  })

  const initialValues: TemplateSettingsFormValues = {
    title: journey?.title,
    description: journey?.description,
    featured: false,
    strategySlug: journey?.strategySlug,
    tagIds: journey?.tags.map(({ id }) => id),
    creatorDescription: journey?.creatorDescription,
    languageId: journey?.language?.id,
    journeyCustomizationDescription:
      journey?.journeyCustomizationDescription ??
      formatTemplateCustomizationString(getTemplateCustomizationFields(journey))
  }

  function handleClose(resetForm: () => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete before resetting form values
      setTimeout(() => resetForm())
    }
  }

  async function handleSubmit(
    values: TemplateSettingsFormValues
  ): Promise<void> {
    if (journey == null) return
    const titleDescLangDirty =
      values.title !== initialValues.title ||
      values.description !== initialValues.description ||
      values.languageId !== initialValues.languageId
    const customizationDirty =
      values.journeyCustomizationDescription !==
      initialValues.journeyCustomizationDescription

    try {
      if (titleDescLangDirty) {
        await titleDescLanguageUpdate({
          variables: {
            id: journey.id,
            input: {
              title: values.title,
              description: values.description,
              languageId: values.languageId
            }
          }
        })
      }
      if (customizationDirty) {
        await journeyCustomizationDescriptionUpdate({
          variables: {
            journeyId: journey.id,
            string: values.journeyCustomizationDescription
          },
          refetchQueries: ['GetPublisherTemplate']
        })
      }
      enqueueSnackbar(t('Template details saved'), {
        variant: 'success',
        preventDuplicate: true
      })
      onClose()
    } catch (error) {
      if (error instanceof ApolloError && error.networkError != null) {
        enqueueSnackbar(
          t('Field update failed. Reload the page or try again.'),
          {
            variant: 'error',
            preventDuplicate: true
          }
        )
        return
      }
      if (error instanceof Error) {
        enqueueSnackbar(
          t('Something went wrong, please reload the page and try again'),
          {
            variant: 'error',
            preventDuplicate: true
          }
        )
      }
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {({ handleSubmit, isSubmitting, resetForm }) => (
        <Form>
          <Dialog
            testId="LocalTemplateDetailsDialog"
            open={open}
            onClose={handleClose(resetForm)}
            dialogTitle={{ title: t('Template Details') }}
            dialogAction={{
              onSubmit: handleSubmit,
              closeLabel: t('Cancel')
            }}
            divider
            fullscreen={!smUp}
            loading={isSubmitting}
          >
            <Stack sx={{ pt: 2 }} gap={5}>
              <MetadataTabPanel showFeaturedSettings={false} />
              <Divider />
              <CustomizeTemplate />
            </Stack>
          </Dialog>
        </Form>
      )}
    </Formik>
  )
}
