import { ApolloError, gql, useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik } from 'formik'
import omit from 'lodash/omit'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { JourneyFeature } from '../../../../../../__generated__/JourneyFeature'
import { useJourneyUpdateMutation } from '../../../../../libs/useJourneyUpdateMutation'

import { AboutTabPanel } from './AboutTabPanel'
import { CategoriesTabPanel } from './CategoriesTabPanel'
import { MetadataTabPanel } from './MetadataTabPanel'
import { TemplateSettingsFormValues } from './useTemplateSettingsForm'

export const JOURNEY_FEATURE_UPDATE = gql`
  mutation JourneyFeature($id: ID!, $feature: Boolean!) {
    journeyFeature(id: $id, feature: $feature) {
      id
      featuredAt
    }
  }
`

interface TemplateSettingsFormProp {
  open: boolean
  onClose: () => void
}

export function TemplateSettingsDialog({
  open,
  onClose
}: TemplateSettingsFormProp): ReactElement {
  const [tab, setTab] = useState(0)
  const { t } = useTranslation()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey } = useJourney()
  const [journeySettingsUpdate] = useJourneyUpdateMutation()
  const [journeyFeature] = useMutation<JourneyFeature>(JOURNEY_FEATURE_UPDATE)
  const { enqueueSnackbar } = useSnackbar()
  const validationSchema = object({
    strategySlug: string()
      .trim()
      .nullable()
      .test('valid-embed-url', t('Invalid embed link'), (value) => {
        if (value == null) return true
        const canvaRegex =
          /^https:\/\/www\.canva\.com\/design\/[A-Za-z0-9]+\/(view|watch)$/

        const googleSlidesRegex =
          /^https:\/\/docs\.google\.com\/presentation\/d\/e\/[A-Za-z0-9-_]+\/pub\?(start=true|start=false)&(loop=true|loop=false)&delayms=\d+$/

        const isValidCanvaLink = canvaRegex.test(value)
        const isValidGoogleLink = googleSlidesRegex.test(value)
        if (!isValidCanvaLink && !isValidGoogleLink) {
          return false
        }
        return true
      })
  })
  const initialValues: TemplateSettingsFormValues = {
    title: journey?.title,
    description: journey?.description,
    featured: journey?.featuredAt != null,
    strategySlug: journey?.strategySlug,
    tagIds: journey?.tags.map(({ id }) => id),
    creatorDescription: journey?.creatorDescription,
    languageId: journey?.language?.id
  }

  function handleTabChange(_event, newValue): void {
    setTab(newValue)
  }

  function handleClose(resetForm: () => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(() => resetForm())
    }
  }

  async function handleSubmit(
    values: TemplateSettingsFormValues
  ): Promise<void> {
    if (journey == null) return
    try {
      await journeySettingsUpdate({
        variables: {
          id: journey.id,
          input: {
            ...omit(values, 'featured')
          }
        }
      })
      if (Boolean(journey.featuredAt) !== values.featured)
        await journeyFeature({
          variables: { id: journey.id, feature: values.featured }
        })
      enqueueSnackbar(t('Template settings have been saved'), {
        variant: 'success',
        preventDuplicate: true
      })
      onClose()
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            'Field update failed. Reload the page or try again.',
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
            open={open}
            onClose={handleClose(resetForm)}
            dialogTitle={{ title: t('Template Settings') }}
            dialogAction={{
              onSubmit: handleSubmit,
              closeLabel: t('Cancel')
            }}
            divider
            fullscreen={!smUp}
            loading={isSubmitting}
          >
            <>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="template-settings-dialog-tabs"
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label={t('Metadata')} {...tabA11yProps('metadata', 0)} />
                <Tab
                  label={t('Categories')}
                  {...tabA11yProps('categories', 1)}
                />
                <Tab label={t('About')} {...tabA11yProps('about', 2)} />
              </Tabs>
              <TabPanel name="metadata" value={tab} index={0}>
                <Stack sx={{ pt: 6 }} gap={5}>
                  <MetadataTabPanel />
                </Stack>
              </TabPanel>
              <TabPanel name="categories" value={tab} index={1}>
                <Stack sx={{ pt: 6 }} gap={5}>
                  <CategoriesTabPanel />
                </Stack>
              </TabPanel>
              <TabPanel name="about" value={tab} index={2}>
                <Stack sx={{ pt: 6 }} gap={5}>
                  <AboutTabPanel />
                </Stack>
              </TabPanel>
            </>
          </Dialog>
        </Form>
      )}
    </Formik>
  )
}
