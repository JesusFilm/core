'use client'

import { Form, Formik, FormikHelpers } from 'formik'
import { ReactElement, ReactNode, useMemo, useState } from 'react'
import { boolean, object, string } from 'yup'

import {
  SelectField,
  SwitchField,
  TextField,
  TextareaField
} from '../../../../components/form'
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

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxValue
} from '@/components/ui/combobox'
import { Field, FieldLabel } from '@/components/ui/field'

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
  /** Resolves on every domain without its own link for this slug. Admin only. */
  global: boolean
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
  global: false,
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

/** Select values must be non-empty strings; these stand in for "unset". */
const NONE = 'none'
const INHERIT = 'inherit'

const PLACEMENT_SELECT_OPTIONS = [
  { value: NONE, label: 'None' },
  ...PLACEMENT_OPTIONS
]
const REDIRECT_STATUS_SELECT_OPTIONS = [
  { value: INHERIT, label: 'Inherit from domain' },
  ...REDIRECT_STATUS_OPTIONS.map((option) => ({
    value: String(option.value),
    label: option.label
  }))
]

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
    global: boolean().test(
      'global-lowercase',
      'Global slugs must be lower-case',
      function (value) {
        const pathname = (this.parent.pathname as string | undefined) ?? ''
        return value !== true || pathname === pathname.toLowerCase()
      }
    ),
    pathname: string()
      .trim()
      .test(
        'global-lowercase',
        'Global slugs must be lower-case',
        function (value) {
          if (mode === 'edit' || value == null || value === '') return true
          return this.parent.global !== true || value === value.toLowerCase()
        }
      )
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

function Section({
  title,
  children
}: {
  title: string
  children: ReactNode
}): ReactElement {
  return (
    <Card>
      <CardPanel className="flex flex-col gap-4">
        <h3 className="text-sm font-medium">{title}</h3>
        {children}
      </CardPanel>
    </Card>
  )
}

function CampaignsField({
  campaigns,
  selectedIds,
  onChange
}: {
  campaigns: LinkFormCampaign[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}): ReactElement {
  const selected = campaigns.filter((campaign) =>
    selectedIds.includes(campaign.id)
  )

  function handleValueChange(next: LinkFormCampaign[]): void {
    onChange(next.map((campaign) => campaign.id))
  }

  return (
    <Field name="campaignIds">
      <FieldLabel>Campaigns</FieldLabel>
      <Combobox<LinkFormCampaign, true>
        items={campaigns}
        multiple
        value={selected}
        onValueChange={handleValueChange}
        itemToStringLabel={(campaign) => campaign.name}
        isItemEqualToValue={(item, value) => item.id === value.id}
      >
        <ComboboxChips className="w-full">
          <ComboboxValue>
            {(value: LinkFormCampaign[]) => (
              <>
                {value.map((campaign) => (
                  <ComboboxChip key={campaign.id}>{campaign.name}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id="campaignIds"
                  placeholder={value.length === 0 ? 'Add to campaigns…' : ''}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxPopup>
          <ComboboxEmpty>No campaigns found.</ComboboxEmpty>
          <ComboboxList>
            {(campaign: LinkFormCampaign) => (
              <ComboboxItem key={campaign.id} value={campaign}>
                {campaign.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </Field>
  )
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
          <Form noValidate className="flex flex-col gap-4">
            {errorMessage != null && (
              <Alert variant="error">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            {destinationLocked && (
              <Alert variant="info">
                <AlertDescription>
                  Only a short-link admin can change the destination of a{' '}
                  {initialValues.assetClass === 'permanent'
                    ? 'permanent'
                    : 'video-embedded'}{' '}
                  link.
                </AlertDescription>
              </Alert>
            )}

            <Section title="Short URL">
              <div className="grid gap-4 md:grid-cols-3">
                <SelectField
                  id="hostname"
                  label="Domain"
                  value={values.hostname}
                  onValueChange={(value) =>
                    void setFieldValue('hostname', value)
                  }
                  options={domains.map((option) => ({
                    value: option.hostname,
                    label: formatDomainLabel(option)
                  }))}
                  disabled={mode === 'edit'}
                  error={errorFor('hostname')}
                  required
                />
                <TextField
                  id="pathname"
                  label="Pathname"
                  value={values.pathname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={mode === 'edit'}
                  error={mode === 'edit' ? undefined : errorFor('pathname')}
                  helperText={
                    mode === 'edit'
                      ? 'Pathnames never change once minted'
                      : getSlugGrammarHint(domain)
                  }
                />
                <SelectField
                  id="service"
                  label="Service"
                  value={values.service}
                  onValueChange={(value) =>
                    void setFieldValue('service', value)
                  }
                  options={serviceOptions}
                  disabled={mode === 'edit'}
                  helperText="The service recorded as the link's creator"
                />
              </div>
              <TextField
                id="to"
                label="Destination URL"
                value={values.to}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={destinationLocked}
                error={errorFor('to')}
                required
              />
            </Section>

            <Section title="Details">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  id="name"
                  label="Name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errorFor('name')}
                />
                <TextField
                  id="language"
                  label="Language (BCP-47)"
                  value={values.language}
                  onChange={handleChange}
                  placeholder="en"
                />
              </div>
              <TextareaField
                id="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
              />
              <div className="grid gap-4 md:grid-cols-3">
                <SelectField
                  id="assetClass"
                  label="Asset class"
                  value={values.assetClass}
                  onValueChange={(value) =>
                    void setFieldValue('assetClass', value)
                  }
                  options={ASSET_CLASS_OPTIONS}
                  helperText={
                    values.assetClass === 'videoEmbedded'
                      ? 'Printed in a video: admin-only destination changes with a note'
                      : values.assetClass === 'permanent'
                        ? 'Admin-only destination changes'
                        : 'Any editor may change the destination'
                  }
                />
                <SelectField
                  id="placement"
                  label="Placement"
                  value={values.placement === '' ? NONE : values.placement}
                  onValueChange={(value) =>
                    void setFieldValue('placement', value === NONE ? '' : value)
                  }
                  options={PLACEMENT_SELECT_OPTIONS}
                />
                <SelectField
                  id="status"
                  label="Status"
                  value={values.status}
                  onValueChange={(value) => void setFieldValue('status', value)}
                  options={STATUS_OPTIONS}
                />
              </div>
              {isAdmin ? (
                <SwitchField
                  id="global"
                  label="Global"
                  checked={values.global}
                  onCheckedChange={(checked) =>
                    void setFieldValue('global', checked)
                  }
                  error={errorFor('global')}
                  helperText="Resolves on every short-link domain that has no link of its own for this slug. Global slugs must be lower-case and are unique across all domains."
                />
              ) : (
                values.global && (
                  <div className="flex items-center gap-2">
                    <Badge variant="info">Global</Badge>
                    <span className="text-muted-foreground text-xs">
                      Resolves on every short-link domain. Only an admin can
                      change this.
                    </span>
                  </div>
                )
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  id="youtubeVideoId"
                  label="YouTube video ID"
                  value={values.youtubeVideoId}
                  onChange={handleChange}
                />
                <TextField
                  id="videoId"
                  label="Core video ID"
                  value={values.videoId}
                  onChange={handleChange}
                  placeholder="1_jf-0-0"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <TagsInput
                  value={values.tags}
                  onChange={(tags) => void setFieldValue('tags', tags)}
                />
                <CampaignsField
                  campaigns={campaigns}
                  selectedIds={values.campaignIds}
                  onChange={(ids) => void setFieldValue('campaignIds', ids)}
                />
              </div>
            </Section>

            <Section title="Redirect overrides">
              <div className="grid gap-4 md:grid-cols-3">
                <SelectField
                  id="redirectStatus"
                  label="Redirect status"
                  value={
                    values.redirectStatus === ''
                      ? INHERIT
                      : String(values.redirectStatus)
                  }
                  onValueChange={(value) =>
                    void setFieldValue(
                      'redirectStatus',
                      value === INHERIT ? '' : Number(value)
                    )
                  }
                  options={REDIRECT_STATUS_SELECT_OPTIONS}
                  helperText="Blank inherits the domain setting"
                />
                <TextField
                  id="fallbackTo"
                  label="Fallback URL while paused"
                  value={values.fallbackTo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errorFor('fallbackTo')}
                  helperText="Blank uses the domain fallback"
                  className="md:col-span-2"
                />
              </div>
            </Section>

            <div className="flex justify-end gap-2">
              {onCancel != null && (
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" loading={submitting}>
                {mode === 'create' ? 'Create link' : 'Save changes'}
              </Button>
            </div>
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
