import { ReactElement, useMemo } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import { Formik, Form, FormikValues } from 'formik'
import { useQuery, gql } from '@apollo/client'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import { GetVideoLanguages } from '../../../__generated__/GetVideoLanguages'

export const GET_VIDEO_LANGUAGES = gql`
  query GetVideoLanguages($id: ID!, $languageId: ID!) {
    video(id: $id, idType: slug) {
      id
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

interface AudioLanguageDialogProps {
  open: boolean
  onClose: () => void
}

export function AudioLanguageDialog({
  open,
  onClose
}: AudioLanguageDialogProps): ReactElement {
  // udpate the query once URL work is merged
  const { data } = useQuery<GetVideoLanguages>(GET_VIDEO_LANGUAGES, {
    variables: {
      id: '1_jf-0-0',
      languageId: '529'
    }
  })

  const handleSubmit = (values?: FormikValues): void => {
    // TODO: Redirect to the right audio URL once URL work is merged
    console.log('redirecting to right audio url')
    onClose()
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
          onSubmit={handleSubmit}
        >
          {({ values, handleSubmit, setFieldValue }) => (
            <Dialog
              open={open}
              onClose={onClose}
              dialogTitle={{ title: 'Language' }}
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
                    handleSubmit()
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      hiddenLabel
                      placeholder="Search Language"
                      label="Language"
                      helperText={`${
                        data?.video?.variantLanguages.length ?? 0
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
