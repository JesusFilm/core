import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import Stack from '@mui/system/Stack'
import { Form, Formik, FormikValues } from 'formik'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'
import type {
  Language,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

interface LangaugeFilterDialogProps {
  open: boolean
  onClose: () => void
  languages?: Language[]
  loading: boolean
}

const DEFAULT_LANGUAGE_ID = '529'

export function LanguageFilterDialog({
  open,
  onClose,
  languages,
  loading
}: LangaugeFilterDialogProps): ReactElement {
  const router = useRouter()
  const handleSubmit = (values: FormikValues): void => {
    void router.push({
      pathname: '/templates',
      query: { languageId: values.language.id }
    })
    onClose()
  }

  function getLanguage(languageId: string): LanguageOption {
    const id = languages?.find((language) => language?.id === languageId)?.id
    const localName = languages
      ?.find((language) => language?.id === id)
      ?.name?.find(({ primary }) => !primary)?.value
    const nativeName = languages
      ?.find((language) => language?.id === id)
      ?.name?.find(({ primary }) => primary)?.value

    return {
      id: id != null ? id : '',
      localName,
      nativeName
    }
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(
        () =>
          resetForm({
            values: {
              language: getLanguage(DEFAULT_LANGUAGE_ID)
            }
          }),
        500
      )
    }
  }

  return (
    <Formik
      initialValues={{
        language:
          languages != null ? getLanguage(DEFAULT_LANGUAGE_ID) : undefined
      }}
      onSubmit={handleSubmit}
    >
      {({ values, handleSubmit, resetForm, setFieldValue }) => (
        <Dialog
          open={open}
          onClose={handleClose(resetForm)}
          dialogTitle={{ title: 'Edit Language' }}
          dialogAction={{
            onSubmit: handleSubmit,
            closeLabel: 'Cancel'
          }}
        >
          <Form>
            <LanguageAutocomplete
              onChange={async (value) => await setFieldValue('language', value)}
              value={values.language}
              languages={languages}
              loading={loading}
              renderOption={(props, option, { selected }) => {
                const { localName, nativeName } = option
                return (
                  <li {...props}>
                    <Checkbox sx={{ mr: 2 }} checked={selected} />
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
  )
}
