import { ComponentProps, ReactElement } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import {
  Language,
  LanguageAutocomplete
} from '@core/shared/ui/LanguageAutocomplete'
import { Formik, Form, FormikValues } from 'formik'
import TextField from '@mui/material/TextField'
import LanguageIcon from '@mui/icons-material/Language'
import { useRouter } from 'next/router'
import { useVideo } from '../../libs/videoContext'

interface AudioLanguageDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {}

export function AudioLanguageDialog({
  open,
  onClose
}: AudioLanguageDialogProps): ReactElement {
  const { variant, variantLanguagesWithSlug } = useVideo()
  const router = useRouter()

  const languages = variantLanguagesWithSlug?.map(
    ({ language }) => language
  ) as unknown as Language[]

  function handleSubmit(value: FormikValues): void {
    const selectedLanguageSlug = variantLanguagesWithSlug?.find(
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
                  helperText={`${languages?.length ?? 0} Languages Available`}
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
  )
}
