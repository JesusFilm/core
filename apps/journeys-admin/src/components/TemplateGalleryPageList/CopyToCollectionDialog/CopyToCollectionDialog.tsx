import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik, FormikHelpers } from 'formik'
import sortBy from 'lodash/sortBy'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'
import { boolean, object, string } from 'yup'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { TranslationDialogWrapper } from '@core/journeys/ui/TranslationDialogWrapper'
import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateSubscription/supportedLanguages'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useTemplateGalleryPagesQuery } from '../../../libs/useTemplateGalleryPagesQuery'

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

interface FormValues {
  collectionSelect: string
  languageSelect?: JourneyLanguage
  showTranslation: boolean
}

export interface CopyToCollectionDialogProps {
  open: boolean
  loading?: boolean
  errorMessage?: string
  done?: boolean
  selectedCollectionTitle?: string
  journeyTitle?: string
  onClose: () => void
  onSubmit: (values: {
    collectionId: string
    language?: JourneyLanguage
    showTranslation: boolean
  }) => void
  translationProgress?: {
    progress: number
    message: string
  }
  isTranslating?: boolean
}

/**
 * CopyToCollectionDialog provides a dialog for copying a journey into a
 * Collection (TemplateGalleryPage) in the active team, optionally translating
 * the copy as part of the action.
 *
 * Visually modeled on `CopyToTeamDialog` but admin-app specific:
 * - Replaces the team picker with a collection picker sourced from
 *   `useTemplateGalleryPagesQuery({ teamId: activeTeam?.id ?? '' }, {
 *   skip: activeTeam?.id == null })`.
 * - Does NOT set `enableReinitialize` on Formik (see NES-1543 Pattern 3).
 * - Surfaces three terminal UI states driven purely by props: loading,
 *   error (`errorMessage`), and done (`done === true`). Orchestration of
 *   the underlying mutations lives in the menu item that mounts this
 *   dialog.
 */
export function CopyToCollectionDialog({
  open,
  loading,
  errorMessage,
  done,
  selectedCollectionTitle,
  journeyTitle,
  onClose,
  onSubmit,
  translationProgress,
  isTranslating = false
}: CopyToCollectionDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const teamId = activeTeam?.id
  const skipQuery = teamId == null
  const {
    data: pagesData,
    loading: pagesLoading
  } = useTemplateGalleryPagesQuery(
    { teamId: teamId ?? '' },
    { skip: skipQuery }
  )

  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: [...SUPPORTED_LANGUAGE_IDS]
    }
  })

  const pages = pagesData?.templateGalleryPages ?? []
  const sortedPages = sortBy(pages, 'title')
  const optionsUnavailable = skipQuery || pagesLoading || pages.length === 0

  const dialogTitleText =
    journeyTitle != null && journeyTitle !== ''
      ? t('Copy "{{title}}" to collection', { title: journeyTitle })
      : t('Copy to collection')

  // Terminal states (error / done) replace the form body entirely and
  // present a single "Done" button bound to `onClose`. Use the shared
  // `Dialog` directly here so we can fully control the action area —
  // `TranslationDialogWrapper`'s action area always renders Cancel +
  // Submit when not loading.
  if (errorMessage != null || done === true) {
    const statusMessage =
      errorMessage != null
        ? errorMessage
        : t('Copied to {{title}}.', {
            title: selectedCollectionTitle ?? ''
          })

    const handleDoneClick = (): void => {
      onClose()
    }

    return (
      <Dialog
        open={open}
        onClose={onClose}
        dialogTitle={{ title: dialogTitleText }}
        testId="CopyToCollectionDialog"
        dialogActionChildren={
          <Button
            variant="contained"
            onClick={handleDoneClick}
            sx={{ backgroundColor: 'secondary.dark' }}
            data-testid="CopyToCollectionDialogDoneButton"
          >
            {t('Done')}
          </Button>
        }
      >
        <Box
          role="status"
          aria-live="polite"
          data-testid="CopyToCollectionDialogStatus"
          sx={{ py: 2 }}
        >
          <Typography variant="body1" color="text.primary">
            {statusMessage}
          </Typography>
        </Box>
      </Dialog>
    )
  }

  const baseLanguageShape = {
    id: string(),
    localName: string().optional(),
    nativeName: string().optional()
  }

  const copyToSchema = object({
    collectionSelect: string().required(t('Please select a collection')),
    showTranslation: boolean().required(),
    languageSelect: object(baseLanguageShape)
      .nullable()
      .when('showTranslation', {
        is: true,
        then: (schema) =>
          schema.required(t('Please select a language')).shape({
            id: string().required(t('Please select a language'))
          }),
        otherwise: (schema) => schema.nullable().optional()
      })
  })

  async function handleFormikSubmit(
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ): Promise<void> {
    onSubmit({
      collectionId: values.collectionSelect,
      language: values.showTranslation ? values.languageSelect : undefined,
      showTranslation: values.showTranslation
    })
    resetForm({ values })
  }

  return (
    <Formik<FormValues>
      initialValues={{
        collectionSelect: '',
        languageSelect: undefined,
        showTranslation: false
      }}
      onSubmit={handleFormikSubmit}
      validationSchema={copyToSchema}
    >
      {({
        values,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting,
        isValid,
        setFieldValue,
        touched,
        setTouched,
        resetForm
      }): ReactElement => {
        const submitDisabled =
          loading === true ||
          isSubmitting ||
          optionsUnavailable ||
          !isValid ||
          values.collectionSelect === ''

        const handleFormSubmit = async (): Promise<void> => {
          await setTouched({
            collectionSelect: true,
            ...(values.showTranslation ? { languageSelect: true } : {})
          })
          handleSubmit()
        }

        const handleDialogClose = (
          _?: object,
          reason?: 'backdropClick' | 'escapeKeyDown'
        ): void => {
          if (
            (loading === true || isTranslating) &&
            (reason === 'backdropClick' || reason === 'escapeKeyDown')
          )
            return
          onClose()
          resetForm()
        }

        return (
          <TranslationDialogWrapper
            open={open}
            onClose={handleDialogClose}
            onTranslate={handleFormSubmit}
            title={dialogTitleText}
            loading={loading === true || isSubmitting}
            isTranslation={values.showTranslation || isTranslating}
            submitLabel={t('Copy')}
            disabled={submitDisabled}
            divider={false}
            testId="CopyToCollectionDialog"
            translationProgress={translationProgress}
          >
            <Stack direction="column" spacing={4}>
              <FormControl variant="filled" hiddenLabel fullWidth>
                <TextField
                  name="collectionSelect"
                  select
                  autoFocus
                  error={Boolean(errors.collectionSelect)}
                  helperText={
                    (errors.collectionSelect as string) ??
                    t('Journey will be copied to selected collection.')
                  }
                  variant="filled"
                  label={t('Select Collection')}
                  data-testid="collection-duplicate-select"
                  disabled={loading === true || isSubmitting}
                  value={values.collectionSelect}
                  onChange={(e): void => {
                    handleChange(e)
                  }}
                  slotProps={{
                    select: {
                      IconComponent: ChevronDownIcon
                    }
                  }}
                  sx={{
                    '& >.MuiFormHelperText-contained': {
                      ml: 0
                    }
                  }}
                >
                  {(() => {
                    if (skipQuery || pagesLoading) {
                      return (
                        <MenuItem
                          key="loading"
                          value=""
                          disabled
                          data-testid="CopyToCollectionDialogLoadingRow"
                        >
                          {t('Loading…')}
                        </MenuItem>
                      )
                    }
                    if (sortedPages.length === 0) {
                      return (
                        <MenuItem
                          key="empty"
                          value=""
                          disabled
                          data-testid="CopyToCollectionDialogEmptyRow"
                        >
                          {t('No collections available')}
                        </MenuItem>
                      )
                    }
                    return sortedPages.map((page) => (
                      <MenuItem
                        key={page.id}
                        value={page.id}
                        aria-label={page.title}
                        sx={{
                          display: 'block',
                          whiteSpace: 'normal',
                          wordWrap: 'break-word'
                        }}
                      >
                        {page.title}
                      </MenuItem>
                    ))
                  })()}
                </TextField>
              </FormControl>
              <Stack direction="row" alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.showTranslation}
                      onChange={(e): void => {
                        void setFieldValue('showTranslation', e.target.checked)
                      }}
                      inputProps={{
                        'aria-label': t(
                          'Translate the copy to another language'
                        )
                      }}
                    />
                  }
                  label={
                    <Typography variant="subtitle2" color="text.primary">
                      {t('Translate the copy to another language')}
                    </Typography>
                  }
                />
              </Stack>
              {values.showTranslation && (
                <LanguageAutocomplete
                  languages={languagesData?.languages}
                  loading={languagesLoading}
                  helperText={
                    touched.languageSelect && errors.languageSelect
                      ? (errors.languageSelect as { id?: string })?.id
                      : ''
                  }
                  onChange={(value): void => {
                    void setFieldValue('languageSelect', value)
                  }}
                  error={
                    touched.languageSelect && Boolean(errors.languageSelect)
                  }
                  value={values.languageSelect}
                />
              )}
            </Stack>
          </TranslationDialogWrapper>
        )
      }}
    </Formik>
  )
}
