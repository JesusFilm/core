import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, useFormikContext } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import LinkExternal from '@core/shared/ui/icons/LinkExternal'

import { JourneyLink } from '../../../../utils/getJourneyLinks/getJourneyLinks'
import { ContactActionType } from '../../../../../../../__generated__/globalTypes'

interface LinksFormProps {
  links: JourneyLink[]
}

export function LinksForm({ links }: LinksFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { values, errors, touched, handleBlur, setFieldValue, handleChange } =
    useFormikContext<Record<string, string>>()

  function handleOpenLink(
    value?: string,
    linkType?: 'url' | 'email' | 'phone' | 'chatButtons',
    contactAction?: ContactActionType | null
  ): void {
    if (value == null || value.trim() === '') return
    const trimmed = value.trim()
    if (linkType === 'email') {
      const mailto = trimmed.startsWith('mailto:')
        ? trimmed
        : `mailto:${trimmed}`
      window.open(mailto, '_blank', 'noopener,noreferrer')
      return
    }
    if (linkType === 'phone') {
      const sanitized = trimmed.replace(/[^\d+\-\s()]/g, '')
      const scheme = contactAction === ContactActionType.text ? 'sms' : 'tel'
      const href = trimmed.startsWith(`${scheme}:`)
        ? trimmed
        : `${scheme}:${sanitized}`
      window.open(href, '_blank', 'noopener,noreferrer')
      return
    }
    const hasProtocol = /^(https?:)?\/\//i.test(trimmed)
    const targetUrl = hasProtocol ? trimmed : `https://${trimmed}`
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  function handleLinkChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target
    const url = /^\w+:\/\//.test(value) ? value : `https://${value}`
    void setFieldValue(name, url)
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target
    // For phone numbers, just store the value as-is without protocol modifications
    void setFieldValue(name, value)
  }

  return (
    <Form id="linksForm" style={{ width: '100%' }}>
      <Stack sx={{ width: '100%' }}>
        {links.map((link) => {
          const fieldName = link.id
          const hasError =
            link.linkType === 'phone'
              ? Boolean(touched?.[`${fieldName}__cc`] && errors?.[`${fieldName}__cc`]) ||
                Boolean(touched?.[`${fieldName}__local`] && errors?.[`${fieldName}__local`])
              : Boolean(touched?.[fieldName]) && Boolean(errors?.[fieldName])
          return (
            <Stack key={fieldName} sx={{ width: '100%' }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6" color="text.primary">
                  {link.label}
                </Typography>
                <IconButton
                  aria-label={t('Open link in new tab')}
                  onClick={() => {
                    if (link.linkType === 'phone') {
                      const cc = values?.[`${fieldName}__cc`] ?? ''
                      const local = values?.[`${fieldName}__local`] ?? ''
                      const normCc = cc === '' ? '' : cc.startsWith('+') ? cc : `+${cc}`
                      const ccDigits = normCc.replace(/[^\d]/g, '')
                      const localDigits = (local ?? '').replace(/[^\d]/g, '')
                      const full = ccDigits === '' && localDigits === '' ? '' : `+${ccDigits}${localDigits}`
                      handleOpenLink(
                        full,
                        'phone',
                        (link as { contactAction?: ContactActionType | null })?.contactAction ?? null
                      )
                    } else {
                      handleOpenLink(
                        values?.[fieldName],
                        link.linkType,
                        (link as { contactAction?: ContactActionType | null })?.contactAction ?? null
                      )
                    }
                  }}
                  edge="end"
                  color="error"
                >
                  <LinkExternal />
                </IconButton>
              </Stack>
              {link.linkType === 'phone' ? (
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                  <TextField
                    id={`${fieldName}__cc`}
                    name={`${fieldName}__cc`}
                    variant="filled"
                    hiddenLabel
                    type="text"
                    sx={{ maxWidth: 120 }}
                    placeholder="+123"
                    value={values?.[`${fieldName}__cc`] ?? ''}
                    onChange={handlePhoneChange}
                    onBlur={handleBlur}
                    error={
                      Boolean(touched?.[`${fieldName}__cc`]) &&
                      Boolean(errors?.[`${fieldName}__cc`])
                    }
                    aria-label={`${t('Edit')} ${link.label} ${t('Country')}`}
                    helperText={
                      Boolean(touched?.[`${fieldName}__cc`]) &&
                      errors?.[`${fieldName}__cc`]
                        ? (errors?.[`${fieldName}__cc`] as string)
                        : ' '
                    }
                  />
                  <TextField
                    id={`${fieldName}__local`}
                    name={`${fieldName}__local`}
                    variant="filled"
                    hiddenLabel
                    fullWidth
                    type="tel"
                    placeholder="0000000000"
                    value={values?.[`${fieldName}__local`] ?? ''}
                    onChange={handlePhoneChange}
                    onBlur={handleBlur}
                    error={
                      Boolean(touched?.[`${fieldName}__local`]) &&
                      Boolean(errors?.[`${fieldName}__local`])
                    }
                    aria-label={`${t('Edit')} ${link.label}`}
                    helperText={
                      Boolean(touched?.[`${fieldName}__local`]) &&
                      errors?.[`${fieldName}__local`]
                        ? (errors?.[`${fieldName}__local`] as string)
                        : ' '
                    }
                  />
                </Stack>
              ) : (
                <TextField
                  id={fieldName}
                  name={fieldName}
                  variant="filled"
                  hiddenLabel
                  fullWidth
                  type={link.linkType === 'email' ? 'email' : 'text'}
                  value={values?.[fieldName] ?? ''}
                  onChange={
                    link.linkType === 'email' || link.linkType === 'chatButtons'
                      ? handleChange
                      : handleLinkChange
                  }
                  onBlur={handleBlur}
                  error={hasError}
                  aria-label={`${t('Edit')} ${link.label}`}
                  helperText={hasError ? (errors?.[fieldName] as string) : ' '}
                />
              )}
            </Stack>
          )
        })}
      </Stack>
    </Form>
  )
}
