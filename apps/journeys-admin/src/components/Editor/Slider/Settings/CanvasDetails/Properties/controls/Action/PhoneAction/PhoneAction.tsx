import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { object, string } from 'yup'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { ContactActionType } from '../../../../../../../../../../__generated__/globalTypes'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { useActionCommand } from '../../../../../../../utils/useActionCommand'

import { countries } from './countriesList'

export function PhoneAction(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep }
  } = useEditor()
  const selectedBlock = stateSelectedBlock as TreeBlock<ButtonBlock> | undefined
  const { addAction } = useActionCommand()

  const phoneAction =
    selectedBlock?.action?.__typename === 'PhoneAction'
      ? selectedBlock.action
      : undefined
  const disableRadioAction =
    !phoneAction?.phone || phoneAction.phone.trim() === ''

  const [callingCode, setCallingCode] = useState<string>(
    phoneAction?.countryCode 
      ? countries.find(country => country.countryCode === phoneAction.countryCode)?.callingCode ?? ''
      : ''
  )

  const selectedCountry = countries.find(
    (country) => country.callingCode === callingCode && country.countryCode === phoneAction?.countryCode
  ) ?? countries.find(
    (country) => country.callingCode === callingCode
  ) ?? countries.find((country) => country.countryCode === 'US') ?? countries[0]

  const phonoDigits = removeCountryCodePrefix(
    phoneAction?.phone ?? '',
    selectedCountry.callingCode
  )

  const [phoneNumber, setPhoneNumber] = useState<string>(phonoDigits)

  function removeCountryCodePrefix(
    fullPhoneNumber: string,
    countryCode: string
  ): string {
    const cleanCountryCode = countryCode.replace('-', '')
    return fullPhoneNumber.substring(cleanCountryCode.length)
  }

  const phoneActionSchema = object({
    phone: string()
      .required(t('Phone number is required'))
      .test(
        'phone-length',
        t('Phone number must be under 15 digits.'),
        function (value) {
          const countryCodeDigits = selectedCountry.callingCode.replace(
            /[-+]/g,
            ''
          )
          const fullPhoneNumber = `+${countryCodeDigits}${value}`
          const totalLength = fullPhoneNumber.length - 1 // Subtract 1 for the + sign
          return totalLength >= 3 && totalLength <= 15
        }
      )
      .test(
        'phone-format',
        t('Phone number must use valid digits.'),
        function (value) {
          const countryCodeDigits = selectedCountry.callingCode.replace(
            /[-+]/g,
            ''
          )
          const fullPhoneNumber = `+${countryCodeDigits}${value}`
          const isValid = /^\+[1-9]\d{2,14}$/.test(fullPhoneNumber)
          return isValid
        }
      )
  })

  const callingCodeSchema = object({
    callingCode: string()
      .required(t('Required'))
      .test(
        'valid-calling-code',
        t('Invalid code.'),
        function (value) {
          // Normalize the value by adding + if missing
          const normalizedValue = value.startsWith('+') ? value : `+${value}`
          return countries.some((country) => country.callingCode === normalizedValue)
        }
      )
  })

  function handleSubmit(phone: string): void {
    if (selectedBlock == null || phone.trim() === '') return

    const countryCodeDigits = selectedCountry.callingCode.replace('-', '')
    const fullPhoneNumber = `${countryCodeDigits}${phone}`
    const { id, action, __typename: blockTypename } = selectedBlock

    addAction({
      blockId: id,
      blockTypename,
      action: {
        __typename: 'PhoneAction',
        parentBlockId: id,
        gtmEventName: '',
        phone: fullPhoneNumber,
        countryCode: selectedCountry.countryCode,
        contactAction: ContactActionType.call
      },
      undoAction: action,
      editorFocus: {
        selectedStep,
        selectedBlock
      }
    })
  }

  function handleCallingCodeChange(newCallingCode: string): void {
    const normalizedCallingCode = newCallingCode === '' 
      ? '' 
      : newCallingCode.startsWith('+') 
        ? newCallingCode 
        : `+${newCallingCode}`
    setCallingCode(normalizedCallingCode)
  }

  function handleContactActionChange(contactAction: ContactActionType): void {
    if (selectedBlock == null || disableRadioAction) return

    const { id, action, __typename: blockTypename } = selectedBlock

    addAction({
      blockId: id,
      blockTypename,
      action: {
        __typename: 'PhoneAction',
        parentBlockId: id,
        gtmEventName: '',
        phone: phoneAction.phone,
        countryCode: phoneAction?.countryCode ?? 'US',
        contactAction
      },
      undoAction: action,
      editorFocus: {
        selectedStep,
        selectedBlock
      }
    })
  }

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
            id="phone"
            label={t('Phone Number')}
            type="tel"
            initialValue={phoneNumber}
            placeholder="0000000000"  
            validationSchema={phoneActionSchema}
            onSubmit={handleSubmit}
            sx={{ flex: 1 }}
          />
        </Box>
        <FormControl fullWidth>
          <RadioGroup
            aria-label={t('Contact action')}
            name="phone-contact-action"
            value={phoneAction?.contactAction ?? ContactActionType.call}
            onChange={(event) => {
              const value = (event.target as HTMLInputElement)
                .value as keyof typeof ContactActionType
              if (value != null) {
                const enumValue = ContactActionType[value]
                if (enumValue != null) handleContactActionChange(enumValue)
              }
            }}
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
                  label={t('SMS')}
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

