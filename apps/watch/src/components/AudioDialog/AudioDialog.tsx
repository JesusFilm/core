import { ComponentProps, ReactElement, useMemo } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import { Formik, Form, FormikValues } from 'formik'
import { useQuery, gql } from '@apollo/client'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Language from '@mui/icons-material/Language'
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
  const { data } = useQuery<GetVideoLanguages>(GET_VIDEO_LANGUAGES, {
    variables: {
      id: slug
    }
  })
  const variant = data?.video?.variant
  const variantLanguagesWithSlug = data?.video?.variantLanguagesWithSlug

  const languages = variantLanguagesWithSlug?.map(({ language }) => language)

  const handleSubmit = (value: FormikValues): void => {
    const selectedLanguageSlug = variantLanguagesWithSlug?.find(
      (languages) => languages.language?.id === value.language.id
    )?.slug
    if (selectedLanguageSlug != null) {
      void router.push(`/${selectedLanguageSlug}`)
    }
  }

  const options = useMemo(() => {
    return (
      languages?.map((language) => {
        const localLanguageName = language?.name.find(
          ({ primary }) => !primary
        )?.value
        const nativeLanguageName = language?.name.find(
          ({ primary }) => primary
        )?.value

        return {
          id: language?.id,
          localName: localLanguageName,
          nativeName: nativeLanguageName
        }
      }) ?? undefined
    )
  }, [languages])

  const sortedOptions = useMemo(() => {
    if (options != null) {
      return options.sort((a, b) => {
        return (a.localName ?? a.nativeName ?? '').localeCompare(
          b.localName ?? b.nativeName ?? ''
        )
      })
    }
    return []
  }, [options])

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
          {({ values, handleSubmit, setFieldValue }) => (
            <Dialog
              open={open}
              onClose={onClose}
              dialogTitle={{
                icon: <Language sx={{ mr: 3 }} />,
                title: 'Language'
              }}
              divider
            >
              <Form>
                <Autocomplete
                  disableClearable
                  options={sortedOptions}
                  value={values.language}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  getOptionLabel={({ localName, nativeName }) =>
                    localName ?? nativeName ?? ''
                  }
                  onChange={(_event, option) => {
                    setFieldValue('language', option)
                    handleSubmit(option)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      hiddenLabel
                      placeholder="Search Language"
                      label="Language"
                      helperText={`${
                        languages?.length ?? 0
                      } Languages Available`}
                    />
                  )}
                  renderOption={(props, { localName, nativeName }) => {
                    return (
                      <li {...props}>
                        <Stack>
                          <Typography>{localName ?? nativeName}</Typography>
                          {localName != null && nativeName != null && (
                            <Typography variant="body2" color="text.secondary">
                              {nativeName}
                            </Typography>
                          )}
                        </Stack>
                      </li>
                    )
                  }}
                />
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
