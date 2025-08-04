import { gql, useQuery } from '@apollo/client'
import LanguageIcon from '@mui/icons-material/Language'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import compact from 'lodash/compact'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, memo } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { GetLanguagesSlug } from '../../../__generated__/GetLanguagesSlug'
import { useVideo } from '../../libs/videoContext'

export const GET_LANGUAGES_SLUG = gql`
  query GetLanguagesSlug($id: ID!) {
    video(id: $id, idType: databaseId) {
      variantLanguagesWithSlug {
        slug
        language {
          id
          slug
          name {
            value
            primary
          }
        }
      }
    }
  }
`

interface AudioLanguageDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {}

export const AudioLanguageDialog = memo(function AudioLanguageDialog({
  open,
  onClose
}: AudioLanguageDialogProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { id, variant, variantLanguagesCount, container } = useVideo()
  const router = useRouter()

  const { loading, data } = useQuery<GetLanguagesSlug>(GET_LANGUAGES_SLUG, {
    variables: {
      id
    }
  })

  const languages = compact(
    data?.video?.variantLanguagesWithSlug?.map(({ language }) => language)
  )

  function handleSubmit(value: FormikValues): void {
    const selectedLanguageSlug = data?.video?.variantLanguagesWithSlug?.find(
      (languages) => languages.language?.id === value.id
    )?.slug
    if (selectedLanguageSlug != null) {
      void router.push(
        `/watch${
          container?.slug != null ? `/${container.slug}/` : '/'
        }${selectedLanguageSlug}`
      )
    }

    onClose?.()
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose?.()
      // wait for dialog animation to complete
      setTimeout(
        () =>
          resetForm({
            values: {
              language:
                variant != null
                  ? {
                      id: variant?.id,
                      localName: variant?.language.name.find(
                        ({ primary }) => !primary
                      )?.value,
                      nativeName: variant?.language.name.find(
                        ({ primary }) => primary
                      )?.value
                    }
                  : undefined
            }
          }),
        500
      )
    }
  }

  return (
    <>
      {languages != null && (
        <Formik
          initialValues={{
            language:
              variant != null
                ? {
                    id: variant?.id,
                    localName: variant?.language?.name.find(
                      ({ primary }) => !primary
                    )?.value,
                    nativeName: variant?.language?.name.find(
                      ({ primary }) => primary
                    )?.value
                  }
                : undefined
          }}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, resetForm }) => (
            <Dialog
              open={open}
              onClose={handleClose(resetForm)}
              dialogTitle={{
                icon: <LanguageIcon sx={{ mr: 3 }} />,
                title: t('Language'),
                closeButton: true
              }}
              divider
              testId="AudioLanguageDialog"
            >
              <Form>
                <LanguageAutocomplete
                  onChange={async (value) => {
                    await setFieldValue('language', value)
                    if (value != null) handleSubmit(value)
                  }}
                  value={values.language}
                  languages={languages}
                  loading={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      hiddenLabel
                      placeholder="Search Language"
                      label={t('Language')}
                      helperText={`${String(
                        variantLanguagesCount
                      )} ${t('Languages Available')}`}
                      sx={{
                        '> .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                />
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
})
