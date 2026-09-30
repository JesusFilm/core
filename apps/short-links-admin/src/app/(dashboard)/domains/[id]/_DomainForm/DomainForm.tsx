'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import PublishRoundedIcon from '@mui/icons-material/PublishRounded'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik } from 'formik'
import { useParams } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { number, object, string } from 'yup'

import { graphql } from '@core/shared/gql'

import { TagsInput } from '../../../../../components/TagsInput'
import {
  NOT_FOUND_OPTIONS,
  REDIRECT_STATUS_OPTIONS,
  SERVICE_OPTIONS,
  SHORT_LINK_DOMAIN_FIELDS,
  Service,
  ShortLinkNotFound,
  emptyToNull,
  formatDateTime,
  formatDomainLabel,
  isMutationError,
  parseMutationError
} from '../../../../../libs/shortLink'

export const GET_SHORT_LINK_DOMAIN = graphql(
  `
    query GetShortLinkDomain($id: String!) {
      shortLinkDomain(id: $id) {
        __typename
        ... on QueryShortLinkDomainSuccess {
          data {
            ...ShortLinkDomainFields
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_DOMAIN_FIELDS]
)

export const SHORT_LINK_DOMAIN_UPDATE = graphql(
  `
    mutation ShortLinkDomainUpdate(
      $input: MutationShortLinkDomainUpdateInput!
    ) {
      shortLinkDomainUpdate(input: $input) {
        __typename
        ... on MutationShortLinkDomainUpdateSuccess {
          data {
            ...ShortLinkDomainFields
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_DOMAIN_FIELDS]
)

export const SHORT_LINK_DOMAIN_PUBLISH = graphql(
  `
    mutation ShortLinkDomainPublish($id: String!) {
      shortLinkDomainPublish(id: $id) {
        __typename
        ... on MutationShortLinkDomainPublishSuccess {
          data {
            ...ShortLinkDomainFields
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_DOMAIN_FIELDS]
)

export const PATH_PREFIX_PATTERN = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/

export interface DomainFormValues {
  pathPrefix: string
  services: Service[]
  redirectStatus: number
  slugAllowedChars: string
  slugMinLength: number
  slugMaxLength: number
  slugCaseSensitive: boolean
  reservedPaths: string[]
  fallbackTo: string
  notFound: ShortLinkNotFound
  passthroughOrigin: string
  autoFailover: boolean
  kvNamespaceId: string
  kvBinding: string
}

export const KV_BINDING_PATTERN = /^[A-Z][A-Z0-9_]*$/

const URL_PATTERN = /^https?:\/\/[^\s]+$/i

const schema = object({
  kvBinding: string()
    .trim()
    .test(
      'kv-binding',
      'Upper-case letters, digits and _ only, starting with a letter, e.g. KV_JESUS_FILM',
      (value) => value == null || value === '' || KV_BINDING_PATTERN.test(value)
    ),
  pathPrefix: string()
    .trim()
    .test(
      'path-prefix',
      'Letters, numbers, _ and - only, with no leading or trailing slash',
      (value) =>
        value == null || value === '' || PATH_PREFIX_PATTERN.test(value)
    ),
  slugAllowedChars: string()
    .required('Allowed characters are required')
    .test('valid-class', 'Not a valid character class', (value) => {
      if (value == null) return false
      try {
        new RegExp(`^[${value}]+$`)
        return true
      } catch {
        return false
      }
    }),
  slugMinLength: number().integer().min(1).required(),
  slugMaxLength: number()
    .integer()
    .max(255)
    .required()
    .test('max-gte-min', 'Max must be at least min', function (value) {
      return value == null || value >= (this.parent.slugMinLength as number)
    }),
  fallbackTo: string()
    .trim()
    .test('url', 'Must be an absolute http(s) URL', (value) =>
      value == null || value === '' ? true : URL_PATTERN.test(value)
    )
    .test(
      'required-for-fallback',
      'Required when not found is fallback',
      function (value) {
        return this.parent.notFound !== 'fallback' || (value ?? '') !== ''
      }
    ),
  passthroughOrigin: string()
    .trim()
    .test('url', 'Must be an absolute http(s) origin', (value) =>
      value == null || value === '' ? true : URL_PATTERN.test(value)
    )
    .test(
      'required-for-passthrough',
      'Required when not found is passthrough',
      function (value) {
        return this.parent.notFound !== 'passthrough' || (value ?? '') !== ''
      }
    )
})

export function DomainForm(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const { enqueueSnackbar } = useSnackbar()
  const [errorMessage, setErrorMessage] = useState<string>()
  const { data, loading, error } = useQuery(GET_SHORT_LINK_DOMAIN, {
    variables: { id }
  })
  const [update, { loading: updating }] = useMutation(SHORT_LINK_DOMAIN_UPDATE)
  const [publish, { loading: publishing }] = useMutation(
    SHORT_LINK_DOMAIN_PUBLISH
  )

  if (loading) return <CircularProgress />
  if (error != null) return <Alert severity="error">{error.message}</Alert>
  const result = data?.shortLinkDomain
  if (result == null || result.__typename !== 'QueryShortLinkDomainSuccess') {
    return (
      <Alert severity="error">
        {result != null && 'message' in result && result.message != null
          ? result.message
          : 'Domain not found'}
      </Alert>
    )
  }
  const domain = result.data

  const initialValues: DomainFormValues = {
    services: [...domain.services],
    redirectStatus: domain.redirectStatus,
    pathPrefix: domain.pathPrefix ?? '',
    slugAllowedChars: domain.slugAllowedChars,
    slugMinLength: domain.slugMinLength,
    slugMaxLength: domain.slugMaxLength,
    slugCaseSensitive: domain.slugCaseSensitive,
    reservedPaths: [...domain.reservedPaths],
    fallbackTo: domain.fallbackTo ?? '',
    notFound: domain.notFound,
    passthroughOrigin: domain.passthroughOrigin ?? '',
    autoFailover: domain.autoFailover,
    kvNamespaceId: domain.kvNamespaceId ?? '',
    kvBinding: domain.kvBinding ?? ''
  }

  async function handleSubmit(values: DomainFormValues): Promise<void> {
    setErrorMessage(undefined)
    try {
      const { data: updated } = await update({
        variables: {
          input: {
            id: domain.id,
            services: values.services,
            redirectStatus: values.redirectStatus,
            pathPrefix: values.pathPrefix.trim(),
            slugAllowedChars: values.slugAllowedChars,
            slugMinLength: values.slugMinLength,
            slugMaxLength: values.slugMaxLength,
            slugCaseSensitive: values.slugCaseSensitive,
            reservedPaths: values.reservedPaths,
            fallbackTo: emptyToNull(values.fallbackTo),
            notFound: values.notFound,
            passthroughOrigin: emptyToNull(values.passthroughOrigin),
            autoFailover: values.autoFailover,
            kvNamespaceId: emptyToNull(values.kvNamespaceId),
            kvBinding: emptyToNull(values.kvBinding)
          }
        }
      })
      const outcome = updated?.shortLinkDomainUpdate
      if (outcome != null && isMutationError(outcome)) {
        setErrorMessage(parseMutationError(outcome).message)
        return
      }
      enqueueSnackbar('Domain saved and republished', { variant: 'success' })
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error ? caught.message : 'Could not save the domain'
      )
    }
  }

  async function handlePublish(): Promise<void> {
    try {
      const { data: published } = await publish({
        variables: { id: domain.id }
      })
      const outcome = published?.shortLinkDomainPublish
      if (outcome != null && isMutationError(outcome)) {
        enqueueSnackbar(parseMutationError(outcome).message, {
          variant: 'error'
        })
        return
      }
      enqueueSnackbar('Domain and its links republished to the edge', {
        variant: 'success'
      })
    } catch (caught) {
      enqueueSnackbar(
        caught instanceof Error ? caught.message : 'Republish failed',
        { variant: 'error' }
      )
    }
  }

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 1000 }}>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Stack spacing={0.5}>
            <Typography component="h2" variant="h5">
              {formatDomainLabel(domain)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {domain.linkCount} links ·{' '}
              {domain.edgePublishedAt != null
                ? `edge published ${formatDateTime(domain.edgePublishedAt)}`
                : 'never published to the edge'}
            </Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<PublishRoundedIcon />}
            onClick={handlePublish}
            loading={publishing}
            disabled={updating}
          >
            Republish domain
          </Button>
        </Stack>
      </Paper>

      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue
        }) => {
          const fieldError = (field: keyof DomainFormValues) =>
            touched[field] === true && typeof errors[field] === 'string'
              ? errors[field]
              : undefined

          return (
            <Form noValidate>
              <Stack spacing={2}>
                {errorMessage != null && (
                  <Alert severity="error">{errorMessage}</Alert>
                )}
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Redirects
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        select
                        fullWidth
                        id="redirectStatus"
                        name="redirectStatus"
                        label="Redirect status"
                        value={values.redirectStatus}
                        onChange={(event) =>
                          void setFieldValue(
                            'redirectStatus',
                            Number(event.target.value)
                          )
                        }
                      >
                        {REDIRECT_STATUS_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        select
                        fullWidth
                        id="notFound"
                        name="notFound"
                        label="Not found behaviour"
                        value={values.notFound}
                        onChange={handleChange}
                      >
                        {NOT_FOUND_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.autoFailover}
                            onChange={(event) =>
                              void setFieldValue(
                                'autoFailover',
                                event.target.checked
                              )
                            }
                          />
                        }
                        label="Auto failover on failed health check"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        id="fallbackTo"
                        name="fallbackTo"
                        label="Fallback URL"
                        value={values.fallbackTo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={fieldError('fallbackTo') != null}
                        helperText={
                          fieldError('fallbackTo') ??
                          'Unresolved traffic (when not found is fallback) and paused links go here'
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        id="passthroughOrigin"
                        name="passthroughOrigin"
                        label="Passthrough origin"
                        value={values.passthroughOrigin}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={fieldError('passthroughOrigin') != null}
                        helperText={
                          fieldError('passthroughOrigin') ??
                          'Receives the untouched path and query when not found is passthrough'
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Slug grammar
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        id="pathPrefix"
                        name="pathPrefix"
                        label="Path prefix"
                        value={values.pathPrefix}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={fieldError('pathPrefix') != null}
                        helperText={
                          fieldError('pathPrefix') ??
                          'Path the short links live under, without slashes, e.g. s. Leave empty for the root.'
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        id="slugAllowedChars"
                        name="slugAllowedChars"
                        label="Allowed characters"
                        value={values.slugAllowedChars}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={fieldError('slugAllowedChars') != null}
                        helperText={
                          fieldError('slugAllowedChars') ??
                          'Regex character-class body, e.g. a-z0-9-'
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                      <TextField
                        fullWidth
                        id="slugMinLength"
                        name="slugMinLength"
                        label="Min length"
                        type="number"
                        value={values.slugMinLength}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={fieldError('slugMinLength') != null}
                        helperText={fieldError('slugMinLength')}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                      <TextField
                        fullWidth
                        id="slugMaxLength"
                        name="slugMaxLength"
                        label="Max length"
                        type="number"
                        value={values.slugMaxLength}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={fieldError('slugMaxLength') != null}
                        helperText={fieldError('slugMaxLength')}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.slugCaseSensitive}
                            onChange={(event) =>
                              void setFieldValue(
                                'slugCaseSensitive',
                                event.target.checked
                              )
                            }
                          />
                        }
                        label="Case-sensitive"
                      />
                    </Grid>
                    <Grid size={12}>
                      <TagsInput
                        id="reservedPaths"
                        label="Reserved paths"
                        helperText="First path segments that are never minted (admin, api, .well-known…)"
                        value={values.reservedPaths}
                        onChange={(paths) =>
                          void setFieldValue('reservedPaths', paths)
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Edge publishing
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        id="kvNamespaceId"
                        name="kvNamespaceId"
                        label="KV namespace id"
                        value={values.kvNamespaceId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText="From `wrangler kv namespace create`. Leave empty until the namespace exists; the domain is not published until then."
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        id="kvBinding"
                        name="kvBinding"
                        label="Worker binding"
                        value={values.kvBinding}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={fieldError('kvBinding') != null}
                        helperText={
                          fieldError('kvBinding') ??
                          'The [[kv_namespaces]] binding in wrangler.toml, e.g. KV_JESUS_FILM. Leave empty until the namespace exists.'
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Services
                  </Typography>
                  <Autocomplete
                    multiple
                    id="services"
                    options={SERVICE_OPTIONS.map((option) => option.value)}
                    value={values.services}
                    onChange={(_event, selected) =>
                      void setFieldValue('services', selected)
                    }
                    renderValue={(selected, getItemProps) =>
                      selected.map((option, index) => {
                        const { key, ...itemProps } = getItemProps({ index })
                        return (
                          <Chip
                            key={key}
                            size="small"
                            label={option}
                            {...itemProps}
                          />
                        )
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Services allowed to mint links"
                        helperText="Leave empty to allow every service"
                      />
                    )}
                  />
                </Paper>

                <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" loading={updating}>
                    Save domain
                  </Button>
                </Stack>
              </Stack>
            </Form>
          )
        }}
      </Formik>
    </Stack>
  )
}
