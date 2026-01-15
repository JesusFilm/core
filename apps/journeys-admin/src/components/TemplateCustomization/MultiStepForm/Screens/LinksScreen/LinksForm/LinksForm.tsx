import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, useFormikContext } from 'formik'
import { useTranslation } from 'next-i18next'
import React, { ReactElement, useRef } from 'react'

import LinkExternal from '@core/shared/ui/icons/LinkExternal'

import { ContactActionType } from '../../../../../../../__generated__/globalTypes'
import { PhoneField } from '../../../../../Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/PhoneAction/PhoneField/PhoneField'
import { getFullPhoneNumber } from '../../../../../Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/PhoneAction/utils/getFullPhoneNumber'
import { normalizeCallingCode } from '../../../../../Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/PhoneAction/utils/normalizeCallingCode'
import { JourneyLink } from '../../../../utils/getJourneyLinks/getJourneyLinks'

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

  function handleLinkBLur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target

    if (!value) return

    const url = /^\w+:\/\//.test(value) ? value : `https://${value}`
    void setFieldValue(name, url)
  }

  function handleLinkChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    void setFieldValue(name, value);
  }

  return (
    <Form id="linksForm" style={{ width: '100%' }}>
      <Stack sx={{ width: '100%' }}>
        {links.map((link) => {
          const fieldName = link.id
          const hasError =
            link.linkType === 'phone'
              ? Boolean(
                  touched?.[`${fieldName}__cc`] && errors?.[`${fieldName}__cc`]
                ) ||
                Boolean(
                  touched?.[`${fieldName}__local`] &&
                    errors?.[`${fieldName}__local`]
                )
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
                      const fullPhoneNumber = getFullPhoneNumber(
                        values?.[`${fieldName}__cc`] ?? '',
                        values?.[`${fieldName}__local`] ?? ''
                      )
                      handleOpenLink(
                        fullPhoneNumber,
                        'phone',
                        (link as { contactAction?: ContactActionType | null })
                          ?.contactAction ?? null
                      )
                    } else {
                      handleOpenLink(
                        values?.[fieldName],
                        link.linkType,
                        (link as { contactAction?: ContactActionType | null })
                          ?.contactAction ?? null
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
                <Box
                  onKeyDown={(e) => {
                    // Because of how Forms are nested, default pressing enter reloads the page.
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      // Move focus to next focusable element
                      const focusableElements = Array.from(
                        document.querySelectorAll<HTMLElement>(
                          'input, button, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
                        )
                      )
                      const currentIndex = focusableElements.indexOf(
                        document.activeElement as HTMLElement
                      )
                      const nextElement = focusableElements[currentIndex + 1]
                      if (nextElement) {
                        nextElement.focus()
                      }
                    }
                  }}
                >
                  <PhoneField
                    callingCode={values?.[`${fieldName}__cc`] ?? ''}
                    phoneNumber={values?.[`${fieldName}__local`] ?? ''}
                    handleCallingCodeChange={(val) => {
                      const normalized = normalizeCallingCode(val ?? '')
                      void setFieldValue(`${fieldName}__cc`, normalized)
                    }}
                    handlePhoneNumberChange={(val) => {
                      const sanitized = (val ?? '').replace(/[^\d]/g, '')
                      void setFieldValue(`${fieldName}__local`, sanitized)
                    }}
                  />
                </Box>
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
                  onBlur={handleLinkBLur}
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
