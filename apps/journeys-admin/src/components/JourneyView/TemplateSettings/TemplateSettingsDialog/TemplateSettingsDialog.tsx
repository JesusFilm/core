import { ApolloError, gql, useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik, FormikValues } from 'formik'
import isEqual from 'lodash/isEqual'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { JourneyFeature } from '../../../../../__generated__/JourneyFeature'
import { useJourneyUpdateMutation } from '../../../../libs/useJourneyUpdateMutation'

import { AboutTabPanel } from './AboutTabPanel'
import { CategoriesTabPanel } from './CategoriesTabPanel'
import { FeaturedCheckbox } from './FeaturedCheckbox'

export const JOURNEY_FEATURE_UPDATE = gql`
  mutation JourneyFeature($id: ID!, $feature: Boolean!) {
    journeyFeature(id: $id, feature: $feature) {
      id
      featuredAt
    }
  }
`
interface TemplateSettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function TemplateSettingsDialog({
  open,
  onClose
}: TemplateSettingsDialogProps): ReactElement {
  const [tabValue, setTabValue] = useState(0)
  const handleTabChange = (_event, newValue): void => {
    setTabValue(newValue)
  }

  const [journeySettingsUpdate] = useJourneyUpdateMutation()
  const [journeyFeature, { loading }] = useMutation<JourneyFeature>(
    JOURNEY_FEATURE_UPDATE
  )

  const { journey } = useJourney()
  const initialTags = journey?.tags.map((tag) => ({
    id: tag.id,
    parentId: tag.parentId
  }))
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const handleTemplateUpdate = async (values: FormikValues): Promise<void> => {
    if (journey == null) return

    const existingValues = (({ title, description, strategySlug, tags }) => ({
      title,
      description,
      strategySlug,
      tags
    }))(journey)

    const formValues = (({ title, description, strategySlug, tags }) => ({
      title,
      description,
      strategySlug: strategySlug === '' ? null : strategySlug,
      tags
    }))(values)

    console.log()

    try {
      if (!isEqual(existingValues, formValues)) {
        await journeySettingsUpdate({
          variables: {
            id: journey.id,
            input: {
              title: values.title,
              description: values.description,
              strategySlug:
                values.strategySlug === '' ? null : values.strategySlug,
              tagIds: values.tags.map((tag) => tag.id)
            }
          },
          optimisticResponse: {
            journeyUpdate: {
              id: journey.id,
              __typename: 'Journey',
              title: values.title,
              description: values.description,
              strategySlug: values.strategySlug,
              tags: [values.tags.map((tag) => ({ id: tag.id }))]
            }
          },
          onCompleted: () =>
            enqueueSnackbar(t('Template settings have been saved'), {
              variant: 'success',
              preventDuplicate: true
            })
        })
      }
      if (Boolean(journey.featuredAt) !== values.featuredAt) {
        await journeyFeature({
          variables: { id: journey.id, feature: values.featuredAt },
          onCompleted: () =>
            enqueueSnackbar(t('Template settings have been saved'), {
              variant: 'success',
              preventDuplicate: true
            })
        })
      }
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

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(() =>
        resetForm({
          values: {
            title: journey?.title,
            description: journey?.description,
            featuredAt: journey?.featuredAt != null,
            strategySlug: journey?.strategySlug,
            tags: initialTags
          }
        })
      )
    }
  }

  const validationSchema = object({
    strategySlug: string()
      .trim()
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

  return (
    <Stack>
      {journey != null && (
        <Formik
          initialValues={{
            title: journey.title ?? '',
            description: journey.description ?? '',
            featuredAt: journey.featuredAt != null,
            strategySlug: journey?.strategySlug ?? '',
            tags: initialTags
          }}
          onSubmit={handleTemplateUpdate}
          validationSchema={validationSchema}
        >
          {({
            values,
            handleChange,
            handleSubmit,
            resetForm,
            errors,
            setFieldValue
          }) => (
            <Dialog
              open={open}
              onClose={handleClose(resetForm)}
              dialogTitle={{ title: 'Template Settings' }}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: 'Cancel'
              }}
              divider
              fullscreen={!smUp}
            >
              <Form data-testId="template-settings-dialog-form">
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="template-settings-dialog-tabs"
                  variant="fullWidth"
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab
                    label={t('Metadata')}
                    {...tabA11yProps('template-meta-data-settings', 0)}
                  />
                  <Tab
                    label={t('Categories')}
                    {...tabA11yProps('template-categories-settings', 1)}
                  />
                  <Tab
                    label={t('About')}
                    {...tabA11yProps('template-about-settings', 2)}
                  />
                </Tabs>
                <TabPanel
                  name="template-meta-data-settings"
                  value={tabValue}
                  index={0}
                >
                  <Stack sx={{ pt: 6 }} gap={5}>
                    <TextField
                      label={t('Title')}
                      id="title"
                      name="title"
                      fullWidth
                      value={values.title}
                      variant="filled"
                      onChange={handleChange}
                      helperText={t('Recommended length: six words or shorter')}
                    />
                    <TextField
                      label={t('Description')}
                      id="description"
                      name="description"
                      fullWidth
                      value={values.description}
                      multiline
                      variant="filled"
                      rows={3}
                      onChange={handleChange}
                      helperText={t(
                        'Publicly visible on template details page'
                      )}
                    />
                    <FeaturedCheckbox
                      loading={loading}
                      value={values.featuredAt}
                      onChange={handleChange}
                      name="featuredAt"
                    />
                  </Stack>
                </TabPanel>
                <CategoriesTabPanel
                  tabValue={tabValue}
                  initialTags={values.tags}
                  onChange={setFieldValue}
                />
                <AboutTabPanel
                  name="strategySlug"
                  value={values.strategySlug}
                  errors={errors}
                  onChange={handleChange}
                  tabValue={tabValue}
                />
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </Stack>
  )
}
