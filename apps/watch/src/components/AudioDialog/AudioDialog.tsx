import { ReactElement, useMemo } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import { Formik, Form } from 'formik'
import { useQuery, gql } from '@apollo/client'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Language from '@mui/icons-material/Language'
import { useRouter } from 'next/router'

import { GetVideoLanguages } from '../../../__generated__/GetVideoLanguages'

// Query to be updated once URL/Path work is fixed
export const GET_VIDEO_LANGUAGES = gql`
  query GetVideoLanguages($id: ID!, $languageId: ID!) {
    video(id: $id, idType: slug) {
      id
      slug(languageId: $languageId) {
        value
      }
      variant {
        id
        language {
          name(languageId: $languageId) {
            value
            primary
          }
        }
      }
      variantLanguages {
        id
        name {
          value
          primary
        }
      }
    }
  }
`

interface AudioDialogProps {
  open: boolean
  onClose: () => void
}

export function AudioDialog({ open, onClose }: AudioDialogProps): ReactElement {
  // udpate the query once URL work is merged
  const { data } = useQuery<GetVideoLanguages>(GET_VIDEO_LANGUAGES, {
    variables: {
      id: '1_jf-0-0',
      languageId: '529'
    }
  })
  const router = useRouter()

  const handleChange = (newValue: {
    language: { id: string; localName: string; nativeName: string }
  }): void => {
    // TODO: Redirect to the right audio URL once URL work is merged
    if (data?.video?.slug != null && data?.video?.slug.length > 0) {
      console.log(`/${data?.video.slug[0].value}/${newValue.language.id}`)
      void router.push(`/${data?.video.slug[0].value}/${newValue.language.id}`)
    }
  }

  const options = useMemo(() => {
    return (
      data?.video?.variantLanguages.map(({ id, name }) => {
        const localLanguageName = name.find(({ primary }) => !primary)?.value
        const nativeLanguageName = name.find(({ primary }) => primary)?.value

        return {
          id: id,
          localName: localLanguageName,
          nativeName: nativeLanguageName
        }
      }) ?? undefined
    )
  }, [data])

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
              data?.video?.variant != null
                ? {
                  id: data?.video?.variant?.id,
                  localName: data?.video?.variant?.language?.name.find(
                    ({ primary }) => !primary
                  )?.value,
                  nativeName: data?.video?.variant?.language?.name.find(
                    ({ primary }) => primary
                  )?.value
                }
                : undefined
          }}
          onSubmit={handleChange}
        >
          {({ values, handleChange, setFieldValue }) => (
            <Dialog
              open={open}
              onClose={onClose}
              dialogTitle={{
                icon: <Language sx={{ mr: 3 }} />,
                title: 'Language'
              }}
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
                    handleChange(option)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      hiddenLabel
                      placeholder="Search Language"
                      label="Language"
                      helperText={`${data?.video?.variantLanguages.length ?? 0
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
