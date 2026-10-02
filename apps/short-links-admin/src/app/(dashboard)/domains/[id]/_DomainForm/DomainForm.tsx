'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { Form, Formik } from 'formik'
import { Trash2Icon, UploadCloudIcon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { ReactElement, ReactNode, useState } from 'react'
import { number, object, string } from 'yup'

import { graphql } from '@core/shared/gql'

import { ConfirmDialog } from '../../../../../components/ConfirmDialog'
import {
  SelectField,
  SwitchField,
  TextField
} from '../../../../../components/form'
import { TagsInput } from '../../../../../components/TagsInput'
import {
  GET_SHORT_LINK_DOMAINS,
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
import { notify, notifyError } from '../../../../../libs/toast'
import { useShortLinkAccess } from '../../../../../libs/useShortLinkAccess'
import { DomainInfrastructure } from '../_DomainInfrastructure'

import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

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

// `KV_*` bindings are the ones api-media owns on the Worker
export const KV_BINDING_PATTERN = /^KV_[A-Z0-9_]+$/

const URL_PATTERN = /^https?:\/\/[^\s]+$/i

const REDIRECT_STATUS_SELECT_OPTIONS = REDIRECT_STATUS_OPTIONS.map(
  (option) => ({
    value: String(option.value),
    label: option.label
  })
)

const schema = object({
  kvBinding: string()
    .trim()
    .test(
      'kv-binding',
      'Upper-case letters, digits and _ only, starting with KV_, e.g. KV_JESUS_FILM',
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

const SERVICE_VALUES = SERVICE_OPTIONS.map((option) => option.value)

function ServicesField({
  value,
  onChange
}: {
  value: Service[]
  onChange: (services: Service[]) => void
}): ReactElement {
  return (
    <Field name="services">
      <FieldLabel>Services allowed to mint links</FieldLabel>
      <Combobox<Service, true>
        items={SERVICE_VALUES}
        multiple
        value={value}
        onValueChange={onChange}
      >
        <ComboboxChips className="w-full">
          <ComboboxValue>
            {(selected: Service[]) => (
              <>
                {selected.map((service) => (
                  <ComboboxChip key={service}>{service}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id="services"
                  placeholder={selected.length === 0 ? 'All services' : ''}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxPopup>
          <ComboboxEmpty>No services found.</ComboboxEmpty>
          <ComboboxList>
            {(service: Service) => (
              <ComboboxItem key={service} value={service}>
                {service}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
      <FieldDescription>Leave empty to allow every service</FieldDescription>
    </Field>
  )
}

export const SHORT_LINK_DOMAIN_DELETE = graphql(`
  mutation ShortLinkDomainDelete($id: String!) {
    shortLinkDomainDelete(id: $id) {
      __typename
      ... on MutationShortLinkDomainDeleteSuccess {
        data {
          id
        }
      }
      ... on NotFoundError {
        message
      }
      ... on ForeignKeyConstraintError {
        message
      }
    }
  }
`)

export function DomainForm(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  // superAdmin owns the path prefix, the KV fields and removing the domain
  const { isSuperAdmin } = useShortLinkAccess()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [removeOpen, setRemoveOpen] = useState(false)
  const [typedHostname, setTypedHostname] = useState('')
  const { data, loading, error } = useQuery(GET_SHORT_LINK_DOMAIN, {
    variables: { id }
  })
  const [update, { loading: updating }] = useMutation(SHORT_LINK_DOMAIN_UPDATE)
  const [publish, { loading: publishing }] = useMutation(
    SHORT_LINK_DOMAIN_PUBLISH
  )
  const [remove, { loading: removing }] = useMutation(
    SHORT_LINK_DOMAIN_DELETE,
    { refetchQueries: [GET_SHORT_LINK_DOMAINS] }
  )

  if (loading) return <Spinner aria-label="Loading domain" />
  if (error != null)
    return (
      <Alert variant="error">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  const result = data?.shortLinkDomain
  if (result == null || result.__typename !== 'QueryShortLinkDomainSuccess') {
    return (
      <Alert variant="error">
        <AlertDescription>
          {result != null && 'message' in result && result.message != null
            ? result.message
            : 'Domain not found'}
        </AlertDescription>
      </Alert>
    )
  }
  const domain = result.data

  const initialValues: DomainFormValues = {
    pathPrefix: domain.pathPrefix ?? '',
    services: [...domain.services],
    redirectStatus: domain.redirectStatus,
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
            slugAllowedChars: values.slugAllowedChars,
            slugMinLength: values.slugMinLength,
            slugMaxLength: values.slugMaxLength,
            slugCaseSensitive: values.slugCaseSensitive,
            reservedPaths: values.reservedPaths,
            fallbackTo: emptyToNull(values.fallbackTo),
            notFound: values.notFound,
            passthroughOrigin: emptyToNull(values.passthroughOrigin),
            autoFailover: values.autoFailover,
            // api-media refuses these from anyone else, so they are only
            // sent (and only shown) for a superAdmin
            ...(isSuperAdmin
              ? {
                  pathPrefix: values.pathPrefix.trim(),
                  kvNamespaceId: emptyToNull(values.kvNamespaceId),
                  kvBinding: emptyToNull(values.kvBinding)
                }
              : {})
          }
        }
      })
      const outcome = updated?.shortLinkDomainUpdate
      if (outcome != null && isMutationError(outcome)) {
        setErrorMessage(parseMutationError(outcome).message)
        return
      }
      notify(
        outcome?.data.edgePublishedAt === domain.edgePublishedAt
          ? 'Domain saved'
          : 'Domain saved and republished',
        'success'
      )
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
        notify(parseMutationError(outcome).message, 'error')
        return
      }
      // every publish stamps a new time, so an unchanged one means api-media
      // skipped it
      if (outcome?.data.edgePublishedAt === domain.edgePublishedAt) {
        notify(
          'Not published',
          'warning',
          'Edge publishing is not configured in this environment.'
        )
        return
      }
      notify('Domain and its links republished to the edge', 'success')
    } catch (caught) {
      notifyError(caught, 'Republish failed')
    }
  }

  function closeRemove(): void {
    setRemoveOpen(false)
    setTypedHostname('')
  }

  async function handleRemove(): Promise<void> {
    try {
      const { data: removed } = await remove({ variables: { id: domain.id } })
      const outcome = removed?.shortLinkDomainDelete
      if (outcome != null && isMutationError(outcome)) {
        notify(parseMutationError(outcome).message, 'error')
        return
      }
      notify('Domain removed', 'success')
      router.push('/domains')
    } catch (caught) {
      notifyError(caught, 'Could not remove the domain')
    } finally {
      closeRemove()
    }
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4">
      <Card>
        <CardPanel className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">
              {formatDomainLabel(domain)}
            </h2>
            <span className="text-muted-foreground text-xs">
              {domain.linkCount} links ·{' '}
              {domain.edgePublishedAt != null
                ? `edge published ${formatDateTime(domain.edgePublishedAt)}`
                : 'never published to the edge'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePublish}
              loading={publishing}
              disabled={updating}
            >
              <UploadCloudIcon aria-hidden="true" />
              Republish domain
            </Button>
            {isSuperAdmin && (
              <Button
                variant="destructive-outline"
                size="sm"
                onClick={() => setRemoveOpen(true)}
                disabled={updating || publishing}
              >
                <Trash2Icon aria-hidden="true" />
                Remove domain
              </Button>
            )}
          </div>
        </CardPanel>
      </Card>

      {isSuperAdmin && <DomainInfrastructure domainId={domain.id} />}

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
            <Form noValidate className="flex flex-col gap-4">
              {errorMessage != null && (
                <Alert variant="error">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <Section title="Redirects">
                <div className="grid gap-4 md:grid-cols-3">
                  <SelectField
                    id="redirectStatus"
                    label="Redirect status"
                    value={String(values.redirectStatus)}
                    onValueChange={(value) =>
                      void setFieldValue('redirectStatus', Number(value))
                    }
                    options={REDIRECT_STATUS_SELECT_OPTIONS}
                  />
                  <SelectField
                    id="notFound"
                    label="Not found behaviour"
                    value={values.notFound}
                    onValueChange={(value) =>
                      void setFieldValue('notFound', value)
                    }
                    options={NOT_FOUND_OPTIONS}
                  />
                  <SwitchField
                    id="autoFailover"
                    label="Auto failover on failed health check"
                    checked={values.autoFailover}
                    onCheckedChange={(checked) =>
                      void setFieldValue('autoFailover', checked)
                    }
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    id="fallbackTo"
                    label="Fallback URL"
                    value={values.fallbackTo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldError('fallbackTo')}
                    helperText="Unresolved traffic (when not found is fallback) and paused links go here"
                  />
                  <TextField
                    id="passthroughOrigin"
                    label="Passthrough origin"
                    value={values.passthroughOrigin}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldError('passthroughOrigin')}
                    helperText="Receives the untouched path and query when not found is passthrough"
                  />
                </div>
              </Section>

              <Section title="Slug grammar">
                {isSuperAdmin && (
                  <TextField
                    id="pathPrefix"
                    label="Path prefix"
                    value={values.pathPrefix}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldError('pathPrefix')}
                    helperText="Path the short links live under, without slashes, e.g. s. Leave empty for the root. Changing it changes what must be attached to the Worker."
                  />
                )}
                <div className="grid gap-4 md:grid-cols-6">
                  <TextField
                    id="slugAllowedChars"
                    label="Allowed characters"
                    value={values.slugAllowedChars}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldError('slugAllowedChars')}
                    helperText="Regex character-class body, e.g. a-z0-9-"
                    className="md:col-span-3"
                  />
                  <TextField
                    id="slugMinLength"
                    label="Min length"
                    type="number"
                    value={values.slugMinLength}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldError('slugMinLength')}
                  />
                  <TextField
                    id="slugMaxLength"
                    label="Max length"
                    type="number"
                    value={values.slugMaxLength}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldError('slugMaxLength')}
                  />
                  <SwitchField
                    id="slugCaseSensitive"
                    label="Case-sensitive"
                    checked={values.slugCaseSensitive}
                    onCheckedChange={(checked) =>
                      void setFieldValue('slugCaseSensitive', checked)
                    }
                  />
                </div>
                <TagsInput
                  id="reservedPaths"
                  label="Reserved paths"
                  helperText="First path segments that are never minted (admin, api, .well-known…)"
                  value={values.reservedPaths}
                  onChange={(paths) =>
                    void setFieldValue('reservedPaths', paths)
                  }
                />
              </Section>

              {isSuperAdmin && (
                <Section title="Edge publishing">
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField
                      id="kvNamespaceId"
                      label="KV namespace id"
                      value={values.kvNamespaceId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText="Filled in by Set up KV. Edit by hand only for local dev, where it is the Worker binding name."
                    />
                    <TextField
                      id="kvBinding"
                      label="Worker binding"
                      value={values.kvBinding}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldError('kvBinding')}
                      helperText="Filled in by Set up KV, e.g. KV_JESUS_FILM. Edit by hand only for local dev."
                    />
                  </div>
                </Section>
              )}

              <Section title="Services">
                <ServicesField
                  value={values.services}
                  onChange={(services) =>
                    void setFieldValue('services', services)
                  }
                />
              </Section>

              <div className="flex justify-end">
                <Button type="submit" loading={updating}>
                  Save domain
                </Button>
              </div>
            </Form>
          )
        }}
      </Formik>

      <ConfirmDialog
        open={removeOpen}
        title={`Remove ${domain.hostname}?`}
        description="Removes the domain from core. Its links must be deleted and its KV setup removed first. Nothing is deleted in Cloudflare."
        confirmLabel="Remove domain"
        confirmColor="error"
        loading={removing}
        confirmDisabled={typedHostname.trim() !== domain.hostname}
        onConfirm={() => void handleRemove()}
        onClose={closeRemove}
      >
        <div className="px-6 pb-2">
          <TextField
            id="confirm-remove-hostname"
            label={`Type ${domain.hostname} to confirm`}
            value={typedHostname}
            onChange={(event) => setTypedHostname(event.target.value)}
            autoComplete="off"
          />
        </div>
      </ConfirmDialog>
    </div>
  )
}
