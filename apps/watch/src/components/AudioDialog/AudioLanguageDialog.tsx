import { ComponentProps, ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'
import { Formik, Form, FormikValues } from 'formik'
import TextField from '@mui/material/TextField'
import LanguageIcon from '@mui/icons-material/Language'
import { useRouter } from 'next/router'
import { compact } from 'lodash'
import { GetLanguagesSlug } from '../../../__generated__/GetLanguagesSlug'
import { useVideo } from '../../libs/videoContext'

export const GET_LANGUAGES_SLUG = gql`
  query GetLanguagesSlug($id: ID!) {
    video(id: $id, idType: databaseId) {
      variantLanguagesWithSlug {
        slug
        language {
          id
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

export function AudioLanguageDialog({
  open,
  onClose
}: AudioLanguageDialogProps): ReactElement {
  const { id, variant, variantLanguagesCount } = useVideo()
  const router = useRouter()

  const { data } = useQuery<GetLanguagesSlug>(GET_LANGUAGES_SLUG, {
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
      void router.push(`/${selectedLanguageSlug}`)
    }
    onClose()
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
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
                title: 'Language'
              }}
              divider
            >
              <Form>
                <LanguageAutocomplete
                  onChange={(value) => {
                    setFieldValue('language', value)
                    if (value != null) handleSubmit(value)
                  }}
                  value={values.language}
                  languages={languages}
                  loading={languages == null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      hiddenLabel
                      placeholder="Search Language"
                      label="Language"
                      helperText={`${String(
                        variantLanguagesCount
                      )} Languages Available`}
                      sx={{
                        '> .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
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
}
