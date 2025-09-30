import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useMemo, useRef, useState } from 'react'
import { object, string } from 'yup'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { ContactActionType } from '../../../../../../../../../../__generated__/globalTypes'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import type { TextFieldFormRef } from '../../../../../../../../TextFieldForm'
import { useActionCommand } from '../../../../../../../utils/useActionCommand'

import { countries } from './countriesList'

export function PhoneAction(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep }
  } = useEditor()
  const selectedBlock = stateSelectedBlock as TreeBlock<ButtonBlock> | undefined
  const { addAction } = useActionCommand()

  // Extract phone action from selected block
  const phoneAction = useMemo(
    () =>
      selectedBlock?.action?.__typename === 'PhoneAction'
        ? selectedBlock.action
        : undefined,
    [selectedBlock?.action]
  )

  // Helper function to find country by calling code
  const findCountryByCallingCode = useCallback(
    (callingCode: string, preferredCountryCode?: string) => {
      return (
        countries.find(
          (country) =>
            country.callingCode === callingCode &&
            country.countryCode === preferredCountryCode
        ) ??
        countries.find((country) => country.callingCode === callingCode) ??
        countries.find((country) => country.countryCode === 'US') ??
        countries[0]
      )
    },
    []
  )

  // Initialize state with existing phone action data
  const [callingCode, setCallingCode] = useState<string>(() => {
    if (!phoneAction?.countryCode) return '+'
    const country = countries.find(
      (c) => c.countryCode === phoneAction.countryCode
    )
    return country?.callingCode ?? '+'
  })

  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    if (!phoneAction?.phone) return ''
    const country = countries.find(
      (c) => c.countryCode === phoneAction.countryCode
    )
    const digits = country?.callingCode?.replace(/[^\d]/g, '') ?? ''
    const prefix = digits === '' ? '' : `+${digits}`
    return phoneAction.phone.startsWith(prefix)
      ? phoneAction.phone.slice(prefix.length)
      : phoneAction.phone.replace(/^\+/, '')
  })

  const callingCodeRef = useRef<TextFieldFormRef>(null)
  const phoneNumberRef = useRef<TextFieldFormRef>(null)

  // Get selected country based on current calling code
  const selectedCountry = useMemo(
    () => findCountryByCallingCode(callingCode, phoneAction?.countryCode),
    [callingCode, phoneAction?.countryCode, findCountryByCallingCode]
  )

  // Check if radio buttons should be disabled
  const disableRadioAction = useMemo(
    () => !phoneAction?.phone || phoneAction.phone.trim() === '',
    [phoneAction?.phone]
  )

  // Validation schemas
  const phoneActionSchema = useMemo(
    () =>
      object({
        phone: string()
          .required(t('Phone number is required'))
          .test(
            'phone-length',
            t('Phone number must be under 15 digits.'),
            function (value) {
              if (!value || !selectedCountry) return false
              const countryCodeDigits = selectedCountry.callingCode.replace(
                /[-+]/g,
                ''
              )
              const fullPhoneNumber = `+${countryCodeDigits}${value}`
              const totalLength = fullPhoneNumber.length - 1
              return totalLength >= 3 && totalLength <= 15
            }
          )
          .test(
            'phone-format',
            t('Phone number must use valid digits.'),
            function (value) {
              if (!value || !selectedCountry) return false
              const countryCodeDigits = selectedCountry.callingCode.replace(
                /[-+]/g,
                ''
              )
              const fullPhoneNumber = `+${countryCodeDigits}${value}`
              return /^\+[1-9]\d{2,14}$/.test(fullPhoneNumber)
            }
          )
      }),
    [t, selectedCountry]
  )

  const callingCodeSchema = useMemo(
    () =>
      object({
        callingCode: string()
          .required(t('Required'))
          .test('valid-calling-code', t('Invalid code.'), function (value) {
            if (!value) return false
            const normalizedValue = value.startsWith('+') ? value : `+${value}`
            return countries.some(
              (country) => country.callingCode === normalizedValue
            )
          })
      }),
    [t]
  )

  // Normalize calling code by adding + if missing
  const normalizeCallingCode = useCallback((code: string) => {
    if (code === '') return ''
    return code.startsWith('+') ? code : `+${code}`
  }, [])

  // Validate and potentially submit action
  const validateAndSubmit = useCallback(
    (callingCodeValue: string, phoneNumberValue: string) => {
      if (!selectedBlock) return

      const normalizedCallingCode = normalizeCallingCode(callingCodeValue)
      const hasValidCallingCode =
        normalizedCallingCode !== '' &&
        countries.some(
          (country) => country.callingCode === normalizedCallingCode
        )
      const hasValidPhoneNumber = phoneNumberValue.trim() !== ''

      // Only validate fields that are empty or invalid
      if (normalizedCallingCode === '' || !hasValidCallingCode) {
        callingCodeRef.current?.validate()
      }
      if (!hasValidPhoneNumber) {
        phoneNumberRef.current?.validate()
      }

      // Submit action if both fields are valid
      if (hasValidCallingCode && hasValidPhoneNumber) {
        const selectedCountryForAction = findCountryByCallingCode(
          normalizedCallingCode,
          phoneAction?.countryCode
        )
        const countryCodeDigits = selectedCountryForAction.callingCode.replace(
          /[^\d]/g,
          ''
        )
        const sanitizedLocal = phoneNumberValue.replace(/[^\d]/g, '')
        const fullPhoneNumber = `+${countryCodeDigits}${sanitizedLocal}`

        addAction({
          blockId: selectedBlock.id,
          blockTypename: selectedBlock.__typename,
          action: {
            __typename: 'PhoneAction',
            parentBlockId: selectedBlock.id,
            gtmEventName: '',
            phone: fullPhoneNumber,
            countryCode: selectedCountryForAction.countryCode,
            contactAction: ContactActionType.call
          },
          undoAction: selectedBlock.action,
          editorFocus: {
            selectedStep,
            selectedBlock
          }
        })
      }
    },
    [
      selectedBlock,
      normalizeCallingCode,
      findCountryByCallingCode,
      phoneAction?.countryCode,
      addAction,
      selectedStep
    ]
  )

  // Event handlers
  const handleCallingCodeChange = useCallback(
    (newCallingCode: string) => {
      const normalizedCode = normalizeCallingCode(newCallingCode)
      setCallingCode(normalizedCode)
      validateAndSubmit(normalizedCode, phoneNumber)
    },
    [normalizeCallingCode, phoneNumber, validateAndSubmit]
  )

  const handlePhoneNumberChange = useCallback(
    (newPhoneNumber: string) => {
      setPhoneNumber(newPhoneNumber)
      validateAndSubmit(callingCode, newPhoneNumber)
    },
    [callingCode, validateAndSubmit]
  )

  // Handle contact action change (Call/Text)
  const handleContactActionChange = useCallback(
    (contactAction: ContactActionType) => {
      if (!selectedBlock || disableRadioAction || !phoneAction) return

      addAction({
        blockId: selectedBlock.id,
        blockTypename: selectedBlock.__typename,
        action: {
          __typename: 'PhoneAction',
          parentBlockId: selectedBlock.id,
          gtmEventName: '',
          phone: phoneAction.phone,
          countryCode: phoneAction.countryCode ?? 'US',
          contactAction
        },
        undoAction: selectedBlock.action,
        editorFocus: {
          selectedStep,
          selectedBlock
        }
      })
    },
    [selectedBlock, disableRadioAction, phoneAction, addAction, selectedStep]
  )

  // Handle radio button change
  const handleRadioChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value as keyof typeof ContactActionType
      if (value != null) {
        const enumValue = ContactActionType[value]
        if (enumValue != null) {
          handleContactActionChange(enumValue)
        }
      }
    },
    [handleContactActionChange]
  )

  return (
    <>
      <Typography
        variant="caption"
        color="secondary.main"
        sx={{ mt: 1, mb: 3 }}
      >
        {t('This will open the phone dialer with the provided phone number.')}
      </Typography>
      <Stack data-testid="PhoneAction" direction="column" spacing={2}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextFieldForm
            ref={callingCodeRef}
            id="callingCode"
            label={t('Country')}
            type="text"
            initialValue={callingCode}
            validationSchema={callingCodeSchema}
            onSubmit={handleCallingCodeChange}
            placeholder="+123"
            sx={{ maxWidth: 70 }}
          />
          <TextFieldForm
            ref={phoneNumberRef}
            id="phone"
            label={t('Phone Number')}
            type="tel"
            initialValue={phoneNumber}
            placeholder="0000000000"
            validationSchema={phoneActionSchema}
            onSubmit={handlePhoneNumberChange}
            sx={{ flex: 1 }}
          />
        </Box>
        <FormControl fullWidth>
          <RadioGroup
            aria-label={t('Contact action')}
            name="phone-contact-action"
            value={phoneAction?.contactAction ?? ContactActionType.call}
            onChange={handleRadioChange}
          >
            <Tooltip
              title={disableRadioAction ? t('Phone number is required') : ''}
              placement="right"
            >
              <span>
                <FormControlLabel
                  value={ContactActionType.call}
                  control={<Radio />}
                  label={t('Call')}
                  disabled={disableRadioAction}
                />
              </span>
            </Tooltip>
            <Tooltip
              title={disableRadioAction ? t('Phone number is required') : ''}
              placement="right"
            >
              <span>
                <FormControlLabel
                  value={ContactActionType.text}
                  control={<Radio />}
                  label={t('Text (SMS)')}
                  disabled={disableRadioAction}
                />
              </span>
            </Tooltip>
          </RadioGroup>
        </FormControl>
      </Stack>
    </>
  )
}
