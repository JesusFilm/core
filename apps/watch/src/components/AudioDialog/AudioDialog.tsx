import { ComponentProps, ReactElement } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import {
  Language,
  LanguageAutocomplete
} from '@core/shared/ui/LanguageAutocomplete'
import { Formik, Form, FormikValues } from 'formik'
import { useQuery, gql } from '@apollo/client'
import TextField from '@mui/material/TextField'
import LanguageIcon from '@mui/icons-material/Language'
import { useRouter } from 'next/router'
import { GetVideoLanguages } from '../../../__generated__/GetVideoLanguages'

export const GET_VIDEO_LANGUAGES = gql`
  query GetVideoLanguages($id: ID!) {
    video(id: $id, idType: slug) {
      id
      variant {
        id
        language {
          name {
            value
            primary
          }
        }
      }
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

interface AudioDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {
  slug: string
}

export function AudioDialog({
  open,
  slug,
  onClose
}: AudioDialogProps): ReactElement {
  const router = useRouter()
  const { data, loading } = useQuery<GetVideoLanguages>(GET_VIDEO_LANGUAGES, {
    variables: {
      id: slug
    }
  })
  const variant = data?.video?.variant
  const variantLanguagesWithSlug = data?.video?.variantLanguagesWithSlug

  const languages = variantLanguagesWithSlug?.map(
    ({ language }) => language
  ) as unknown as Language[]

  const handleSubmit = (value: FormikValues): void => {
    const selectedLanguageSlug = variantLanguagesWithSlug?.find(
      (languages) => languages.language?.id === value.id
    )?.slug
    if (selectedLanguageSlug != null) {
      void router.push(`/${selectedLanguageSlug}`)
    }
  }

  return (
    <>
      {data?.video != null && (
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
          {({ values, setFieldValue }) => (
            <Dialog
              open={open}
              onClose={onClose}
              dialogTitle={{
                icon: <LanguageIcon sx={{ mr: 3 }} />,
                title: 'Language'
              }}
              divider
            >
              <Form>
                {languages != null && (
                  <LanguageAutocomplete
                    onChange={(value) => {
                      setFieldValue('language', value)
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
                        label="Language"
                        helperText={`${
                          languages?.length ?? 0
                        } Languages Available`}
                        sx={{
                          '> .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    )}
                  />
                )}
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
