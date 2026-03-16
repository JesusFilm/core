import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, useFormikContext } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { MessageChatIcon } from '@core/journeys/ui/MessageChatIcon'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'

import {
  ContactActionType,
  MessagePlatform
} from '../../../../../../../__generated__/globalTypes'
import { PhoneField } from '../../../../../Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/PhoneAction/PhoneField/PhoneField'
import { getFullPhoneNumber } from '../../../../../Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/PhoneAction/utils/getFullPhoneNumber'
import { normalizeCallingCode } from '../../../../../Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/PhoneAction/utils/normalizeCallingCode'
import { JourneyLink } from '../../../../utils/getJourneyLinks/getJourneyLinks'

interface LinksFormProps {
  links: JourneyLink[]
  onPlatformChange?: (chatButtonId: string, platform: MessagePlatform) => void
}

export function LinksForm({
  links,
  onPlatformChange
}: LinksFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const messagePlatformOptions: Array<{
    value: MessagePlatform
    label: string
  }> = [
    { value: MessagePlatform.custom, label: t('Chat') },
    { value: MessagePlatform.facebook, label: t('Facebook Messenger') },
    { value: MessagePlatform.instagram, label: t('Instagram') },
    { value: MessagePlatform.kakaoTalk, label: t('KakaoTalk') },
    { value: MessagePlatform.line, label: t('LINE') },
    { value: MessagePlatform.skype, label: t('Skype') },
    { value: MessagePlatform.snapchat, label: t('Snapchat') },
    { value: MessagePlatform.telegram, label: t('Telegram') },
    { value: MessagePlatform.tikTok, label: t('TikTok') },
    { value: MessagePlatform.viber, label: t('Viber') },
    { value: MessagePlatform.vk, label: t('VK') },
    { value: MessagePlatform.whatsApp, label: t('WhatsApp') },
    { value: MessagePlatform.globe2, label: t('Globe 1') },
    { value: MessagePlatform.globe3, label: t('Globe 2') },
    { value: MessagePlatform.messageText1, label: t('Message Text Circle') },
    { value: MessagePlatform.messageText2, label: t('Message Text Square') },
    { value: MessagePlatform.send1, label: t('Send 1') },
    { value: MessagePlatform.send2, label: t('Send 2') },
    { value: MessagePlatform.messageChat2, label: t('Message Chat Circle') },
    { value: MessagePlatform.messageCircle, label: t('Message Circle') },
    {
      value: MessagePlatform.messageNotifyCircle,
      label: t('Message Notify Circle')
    },
    {
      value: MessagePlatform.messageNotifySquare,
      label: t('Message Notify Square')
    },
    { value: MessagePlatform.messageSquare, label: t('Message Square') },
    { value: MessagePlatform.mail1, label: t('Mail') },
    { value: MessagePlatform.linkExternal, label: t('Link External') },
    { value: MessagePlatform.home3, label: t('Home 1') },
    { value: MessagePlatform.home4, label: t('Home 2') },
    { value: MessagePlatform.helpCircleContained, label: t('Help Circle') },
    { value: MessagePlatform.helpSquareContained, label: t('Help Square') },
    { value: MessagePlatform.shieldCheck, label: t('Shield Check') },
    { value: MessagePlatform.menu1, label: t('Menu') },
    { value: MessagePlatform.checkBroken, label: t('Check Broken') },
    { value: MessagePlatform.checkContained, label: t('Check Contained') },
    { value: MessagePlatform.settings, label: t('Settings') }
  ]
  const { values, errors, touched, setFieldValue, handleChange } =
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

  function handleLinkBLur(e: React.FocusEvent<HTMLInputElement>): void {
    const { name, value } = e.target
    if (!value) return
    const url = /^\w+:\/\//.test(value) ? value : `https://${value}`
    void setFieldValue(name, url)
  }

  function handlePlatformSelect(
    event: SelectChangeEvent<string>,
    chatButtonId: string
  ): void {
    const platform = event.target.value as MessagePlatform
    onPlatformChange?.(chatButtonId, platform)
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
              {link.linkType === 'chatButtons' ? (
                <Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      height: 56,
                      bgcolor: 'rgba(0, 0, 0, 0.06)',
                      borderRadius: 1,
                      borderBottom: hasError ? 2 : 1,
                      borderColor: hasError
                        ? 'error.main'
                        : 'action.disabledBackground'
                    }}
                  >
                    <FormControl
                      variant="standard"
                      hiddenLabel
                      sx={{ flexShrink: 0, alignSelf: 'stretch' }}
                    >
                      <Select
                        variant="standard"
                        value={link.platform}
                        onChange={(e) => handlePlatformSelect(e, link.id)}
                        IconComponent={ChevronDownIcon}
                        aria-label={t('Select chat icon')}
                        disableUnderline
                        renderValue={(selected) => (
                          <MessageChatIcon
                            platform={selected as MessagePlatform}
                          />
                        )}
                        sx={{
                          height: '100%',
                          pl: 3,
                          pr: 1,
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            pr: '20px !important'
                          }
                        }}
                      >
                        {messagePlatformOptions.map(({ value, label }) => (
                          <MenuItem key={`chat-icon-${value}`} value={value}>
                            <Stack
                              direction="row"
                              spacing={3}
                              alignItems="center"
                            >
                              <MessageChatIcon platform={value} />
                              <Typography>{label}</Typography>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box
                      sx={{
                        width: '1px',
                        alignSelf: 'stretch',
                        my: 2,
                        bgcolor: 'action.disabledBackground',
                        flexShrink: 0,
                        mx: 1
                      }}
                    />
                    <TextField
                      id={fieldName}
                      name={fieldName}
                      variant="standard"
                      hiddenLabel
                      fullWidth
                      placeholder={t('Chat URL')}
                      value={values?.[fieldName] ?? ''}
                      onChange={handleChange}
                      onBlur={handleLinkBLur}
                      error={hasError}
                      aria-label={`${t('Edit')} ${link.label}`}
                      InputProps={{ disableUnderline: true }}
                      sx={{
                        px: 2,
                        alignSelf: 'stretch',
                        justifyContent: 'center'
                      }}
                    />
                  </Stack>
                  <Typography
                    variant="caption"
                    color={hasError ? 'error' : 'transparent'}
                    sx={{ mt: 0.5, mx: 3.5 }}
                  >
                    {hasError ? (errors?.[fieldName] as string) : '\u00A0'}
                  </Typography>
                </Stack>
              ) : link.linkType === 'phone' ? (
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
                  onChange={handleChange}
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
