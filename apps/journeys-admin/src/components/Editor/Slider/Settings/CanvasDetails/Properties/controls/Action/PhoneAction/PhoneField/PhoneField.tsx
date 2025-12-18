import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'
import { object, string } from 'yup'

import {
  TextFieldForm,
  TextFieldFormRef
} from '../../../../../../../../../TextFieldForm'
import { countries } from '../countriesList'

interface PhoneFieldProps {
  callingCodeRef?: React.RefObject<TextFieldFormRef | null>
  phoneNumberRef?: React.RefObject<TextFieldFormRef | null>
  callingCode: string
  phoneNumber: string
  handleCallingCodeChange: (value: string) => void
  handlePhoneNumberChange: (value: string) => void
}

export function PhoneField({
  callingCodeRef,
  phoneNumberRef,
  callingCode,
  phoneNumber,
  handleCallingCodeChange,
  handlePhoneNumberChange
}: PhoneFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const selectedCountry = useMemo(() => {
    const normalized = callingCode?.startsWith('+')
      ? callingCode
      : `+${callingCode ?? ''}`
    return (
      countries.find((c) => c.callingCode === normalized) ??
      countries.find((c) => c.countryCode === 'US') ??
      countries[0]
    )
  }, [callingCode])

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

  const phoneActionSchema = useMemo(
    () =>
      object({
        phone: string()
          .required(t('Phone number is required'))
          .test(
            'phone-no-leading-zero',
            t('Phone number cannot start with 0.'),
            function (value) {
              if (!value) return true
              return !value.startsWith('0')
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
              return /^\+[1-9]\d+$/.test(fullPhoneNumber)
            }
          )
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
      }),
    [t, selectedCountry]
  )

  return (
    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
      <Box sx={{ width: 70, flexShrink: 0 }}>
        <TextFieldForm
          ref={callingCodeRef}
          id="callingCode"
          label={t('Country')}
          type="text"
          initialValue={callingCode}
          validationSchema={callingCodeSchema}
          onSubmit={handleCallingCodeChange}
          placeholder="+123"
          sx={{ width: '100%' }}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TextFieldForm
          ref={phoneNumberRef}
          id="phone"
          label={t('Phone Number')}
          type="tel"
          initialValue={phoneNumber}
          placeholder="0000000000"
          validationSchema={phoneActionSchema}
          onSubmit={handlePhoneNumberChange}
          sx={{ width: '100%' }}
        />
      </Box>
    </Stack>
  )
}
