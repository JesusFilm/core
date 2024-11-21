import { useMutation } from '@apollo/client'
import LoadingButton from '@mui/lab/LoadingButton'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import React, { ReactElement } from 'react'

const CREATE_SHORT_LINK_DOMAIN = graphql(`
  mutation CreateShortLinkDomain($input: MutationShortLinkDomainCreateInput!) {
    shortLinkDomainCreate(input: $input) {
      __typename
      ... on MutationShortLinkDomainCreateSuccess {
        data {
          id
          hostname
        }
      }
      ... on NotUniqueError {
        message
      }
      ... on ZodError {
        fieldErrors {
          message
          path
        }
      }
    }
  }
`)

interface ShortLinkDomainNewDialogProps {
  open: boolean
  onClose: () => void
}

export function ShortLinkDomainNewDialog({
  open,
  onClose
}: ShortLinkDomainNewDialogProps): ReactElement {
  const t = useTranslations()
  const [createShortLinkDomain, { loading }] = useMutation(
    CREATE_SHORT_LINK_DOMAIN,
    {
      refetchQueries: ['GetShortLinkDomains']
    }
  )

  type MutationShortLinkDomainCreateInput = VariablesOf<
    typeof CREATE_SHORT_LINK_DOMAIN
  >['input']

  const initialValues: MutationShortLinkDomainCreateInput = {
    hostname: '',
    services: []
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('Add Short Link Domain')}</DialogTitle>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, formikHelpers) => {
          try {
            const result = await createShortLinkDomain({
              variables: { input: values }
            })
            switch (result.data?.shortLinkDomainCreate?.__typename) {
              case 'MutationShortLinkDomainCreateSuccess':
                onClose()
                break
              case 'NotUniqueError':
                formikHelpers.setErrors({
                  hostname: t('Hostname is not unique')
                })
                break
              case 'ZodError':
                formikHelpers.setErrors(
                  result.data.shortLinkDomainCreate.fieldErrors.reduce(
                    (acc, fieldError) => {
                      const path = fieldError.path.at(-1)
                      if (path) acc[path] = fieldError.message
                      return acc
                    },
                    {} as Record<string, string>
                  )
                )
                break
            }
          } catch (e) {
            console.error(e)
          }
        }}
      >
        {({ handleChange, handleBlur, values, errors }) => (
          <Form>
            <DialogContent>
              <Stack spacing={2}>
                <TextField
                  autoFocus
                  label={t('Hostname')}
                  fullWidth
                  name="hostname"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.hostname}
                  placeholder={t('example.com')}
                  error={errors.hostname != null}
                  helperText={errors.hostname}
                />
                <FormControl fullWidth>
                  <InputLabel>{t('Services')}</InputLabel>
                  <Select
                    multiple
                    name="services"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.services}
                  >
                    <MenuItem value="apiJourneys">{t('Journeys')}</MenuItem>
                    <MenuItem value="apiMedia">{t('Media')}</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="primary">
                {t('Cancel')}
              </Button>
              <LoadingButton
                type="submit"
                color="primary"
                variant="contained"
                loading={loading}
              >
                {t('Add Domain')}
              </LoadingButton>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}
