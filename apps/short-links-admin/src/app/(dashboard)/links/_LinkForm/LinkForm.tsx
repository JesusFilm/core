'use client'

import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikHelpers } from 'formik'
import { ReactElement, useMemo, useState } from 'react'
import { object, string } from 'yup'

import { TagsInput } from '../../../../components/TagsInput'
import {
  ASSET_CLASS_OPTIONS,
  PLACEMENT_OPTIONS,
  REDIRECT_STATUS_OPTIONS,
  SERVICE_OPTIONS,
  STATUS_OPTIONS,
  Service,
  ShortLinkAssetClass,
  ShortLinkPlacement,
  ShortLinkStatus,
  canChangeDestination,
  formatDomainLabel,
  getDestinationChangeRule,
  isDestinationChanged
} from '../../../../libs/shortLink'

import { DestinationChangeDialog } from './_DestinationChangeDialog'

export interface LinkFormDomain {
  id: string
  hostname: string
  pathPrefix?: string | null
  services: readonly string[]
  slugAllowedChars: string
  slugMinLength: number
  slugMaxLength: number
  slugCaseSensitive: boolean
  reservedPaths: readonly string[]
}

export interface LinkFormCampaign {
  id: string
  name: string
}

export interface LinkFormValues {
  hostname: string
  pathname: string
  to: string
  name: string
  description: string
  service: Service
  assetClass: ShortLinkAssetClass
  status: ShortLinkStatus
  placement: ShortLinkPlacement | ''
  language: string
  tags: string[]
  videoId: string
  youtubeVideoId: string
  campaignIds: string[]
  /** '' inherits the domain's redirect status. */
  redirectStatus: number | ''
  fallbackTo: string
  note: string
}

export const EMPTY_LINK_FORM_VALUES: LinkFormValues = {
  hostname: '',
  pathname: '',
  to: '',
  name: '',
  description: '',
  service: 'apiMedia',
  assetClass: 'standard',
  status: 'active',
  placement: '',
  language: '',
  tags: [],
  videoId: '',
  youtubeVideoId: '',
  campaignIds: [],
  redirectStatus: '',
  fallbackTo: '',
  note: ''
}

interface LinkFormProps {
  mode: 'create' | 'edit'
  initialValues: LinkFormValues
  domains: LinkFormDomain[]
  campaigns: LinkFormCampaign[]
  isAdmin: boolean
  submitting: boolean
  errorMessage?: string
  fieldErrors?: Record<string, string>
  /** Describes what the link is printed in, for the protection dialog. */
  videoLabel?: string
  onSubmit: (values: LinkFormValues) => Promise<void> | void
  onCancel?: () => void
}

const OPTIONAL_URL = string()
  .trim()
  .test(
    'absolute-url',
    'Must be an absolute http(s) URL',
    (value) =>
      value == null || value === '' || /^https?:\/\/[^\s]+$/i.test(value)
  )

export function getSlugGrammarHint(domain: LinkFormDomain | undefined): string {
  if (domain == null) return 'Leave blank to generate a pathname'
  const parts = [
    `Allowed: [${domain.slugAllowedChars}], ${domain.slugMinLength}-${domain.slugMaxLength} characters`,
    domain.slugCaseSensitive ? 'case-sensitive' : 'case-insensitive'
  ]
  if (domain.reservedPaths.length > 0)
    parts.push(`reserved: ${domain.reservedPaths.join(', ')}`)
  return `${parts.join(', ')}. Leave blank to generate.`
}

function buildSchema(domains: LinkFormDomain[], mode: 'create' | 'edit') {
  return object({
    hostname: string().required('Choose a domain'),
    to: string()
      .trim()
      .required('Destination is required')
      .matches(/^https?:\/\/[^\s]+$/i, 'Must be an absolute http(s) URL'),
    pathname: string()
      .trim()
      .test(
        'slug-grammar',
        'Does not match the domain slug rules',
        function (value) {
          if (mode === 'edit' || value == null || value === '') return true
          const domain = domains.find(
            (candidate) => candidate.hostname === this.parent.hostname
          )
          if (domain == null) return true
          const pattern = new RegExp(
            `^[${domain.slugAllowedChars}]{${domain.slugMinLength},${domain.slugMaxLength}}$`,
            domain.slugCaseSensitive ? '' : 'i'
          )
          if (!pattern.test(value)) return false
          const reserved = domain.reservedPaths.map((path) =>
            path.toLowerCase()
          )
          return !reserved.includes(value.split('/')[0].toLowerCase())
        }
      ),
    fallbackTo: OPTIONAL_URL,
    name: string().trim().max(200, 'Keep the name under 200 characters')
  })
}

export function LinkForm({
  mode,
  initialValues,
  domains,
  campaigns,
  isAdmin,
  submitting,
  errorMessage,
  fieldErrors,
  videoLabel,
  onSubmit,
  onCancel
}: LinkFormProps): ReactElement {
  const [pending, setPending] = useState<LinkFormValues | null>(null)
  const schema = useMemo(() => buildSchema(domains, mode), [domains, mode])
  const destinationLocked =
    mode === 'edit' && !canChangeDestination(initialValues.assetClass, isAdmin)

  async function handleSubmit(
    values: LinkFormValues,
    helpers: FormikHelpers<LinkFormValues>
  ): Promise<void> {
    const changed =
      mode === 'edit' && isDestinationChanged(initialValues.to, values.to)
    const rule = getDestinationChangeRule(initialValues.assetClass)
    if (changed && rule.requiresConfirmation) {
      setPending(values)
      helpers.setSubmitting(false)
      return
    }
    await onSubmit({ ...values, note: '' })
  }

  async function handleConfirmDestination(note: string): Promise<void> {
    if (pending == null) return
    const values = { ...pending, note }
    setPending(null)
    await onSubmit(values)
  }

  return (
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
        const domain = domains.find(
          (candidate) => candidate.hostname === values.hostname
        )
        const serviceOptions =
          domain != null && domain.services.length > 0
            ? SERVICE_OPTIONS.filter((option) =>
                domain.services.includes(option.value)
              )
            : SERVICE_OPTIONS
        const errorFor = (field: keyof LinkFormValues): string | undefined =>
          fieldErrors?.[field] ??
          (touched[field] === true && typeof errors[field] === 'string'
            ? errors[field]
            : undefined)

        return (
          <Form noValidate>
            <Stack spacing={2}>
              {errorMessage != null && (
                <Alert severity="error">{errorMessage}</Alert>
              )}
              {destinationLocked && (
                <Alert severity="info">
                  Only a short-link admin can change the destination of a{' '}
                  {initialValues.assetClass === 'permanent'
                    ? 'permanent'
                    : 'video-embedded'}{' '}
                  link.
                </Alert>
              )}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Short URL
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      id="hostname"
                      name="hostname"
                      label="Domain"
                      value={values.hostname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={mode === 'edit'}
                      error={errorFor('hostname') != null}
                      helperText={errorFor('hostname')}
                      required
                    >
                      {domains.map((option) => (
                        <MenuItem key={option.id} value={option.hostname}>
                          {formatDomainLabel(option)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      id="pathname"
                      name="pathname"
                      label="Pathname"
                      value={values.pathname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={mode === 'edit'}
                      error={errorFor('pathname') != null}
                      helperText={
                        mode === 'edit'
                          ? 'Pathnames never change once minted'
                          : (errorFor('pathname') ?? getSlugGrammarHint(domain))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      id="service"
                      name="service"
                      label="Service"
                      value={values.service}
                      onChange={handleChange}
                      disabled={mode === 'edit'}
                      helperText="The service recorded as the link's creator"
                    >
                      {serviceOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      id="to"
                      name="to"
                      label="Destination URL"
                      value={values.to}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={destinationLocked}
                      error={errorFor('to') != null}
                      helperText={errorFor('to')}
                      required
                    />
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errorFor('name') != null}
                      helperText={errorFor('name')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="language"
                      name="language"
                      label="Language (BCP-47)"
                      value={values.language}
                      onChange={handleChange}
                      placeholder="en"
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      id="description"
                      name="description"
                      label="Description"
                      value={values.description}
                      onChange={handleChange}
                      multiline
                      minRows={2}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      id="assetClass"
                      name="assetClass"
                      label="Asset class"
                      value={values.assetClass}
                      onChange={handleChange}
                      helperText={
                        values.assetClass === 'videoEmbedded'
                          ? 'Printed in a video: admin-only destination changes with a note'
                          : values.assetClass === 'permanent'
                            ? 'Admin-only destination changes'
                            : 'Any editor may change the destination'
                      }
                    >
                      {ASSET_CLASS_OPTIONS.map((option) => (
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
                      id="placement"
                      name="placement"
                      label="Placement"
                      value={values.placement}
                      onChange={handleChange}
                    >
                      <MenuItem value="">None</MenuItem>
                      {PLACEMENT_OPTIONS.map((option) => (
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
                      id="status"
                      name="status"
                      label="Status"
                      value={values.status}
                      onChange={handleChange}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="youtubeVideoId"
                      name="youtubeVideoId"
                      label="YouTube video ID"
                      value={values.youtubeVideoId}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="videoId"
                      name="videoId"
                      label="Core video ID"
                      value={values.videoId}
                      onChange={handleChange}
                      placeholder="1_jf-0-0"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TagsInput
                      value={values.tags}
                      onChange={(tags) => void setFieldValue('tags', tags)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      multiple
                      id="campaignIds"
                      options={campaigns}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      value={campaigns.filter((campaign) =>
                        values.campaignIds.includes(campaign.id)
                      )}
                      onChange={(_event, selected) =>
                        void setFieldValue(
                          'campaignIds',
                          selected.map((campaign) => campaign.id)
                        )
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Campaigns" />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Redirect overrides
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
                          event.target.value === ''
                            ? ''
                            : Number(event.target.value)
                        )
                      }
                      helperText="Blank inherits the domain setting"
                    >
                      <MenuItem value="">Inherit from domain</MenuItem>
                      {REDIRECT_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      fullWidth
                      id="fallbackTo"
                      name="fallbackTo"
                      label="Fallback URL while paused"
                      value={values.fallbackTo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errorFor('fallbackTo') != null}
                      helperText={
                        errorFor('fallbackTo') ??
                        'Blank uses the domain fallback'
                      }
                    />
                  </Grid>
                </Grid>
              </Paper>

              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'flex-end' }}
              >
                {onCancel != null && (
                  <Button onClick={onCancel} disabled={submitting}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="contained" loading={submitting}>
                  {mode === 'create' ? 'Create link' : 'Save changes'}
                </Button>
              </Stack>
            </Stack>
            <DestinationChangeDialog
              open={pending != null}
              assetClass={initialValues.assetClass}
              from={initialValues.to}
              to={pending?.to ?? values.to}
              videoLabel={videoLabel ?? initialValues.name ?? values.pathname}
              loading={submitting}
              onConfirm={handleConfirmDestination}
              onClose={() => setPending(null)}
            />
          </Form>
        )
      }}
    </Formik>
  )
}
