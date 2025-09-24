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

import { FlagDropdown } from './FlagDropdown'
import { Country, countries } from './FlagDropdown/countriesList'

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
  const disableRadioAction = !phoneAction?.phone || phoneAction.phone.trim() === ''

  const initialCountry = countries.find(
    (country) => country.countryCode === phoneAction?.countryCode
  )

  const fallbackCountry =
    countries.find((country) => country.countryCode === 'US') ?? countries[0]

  const [selectedCountry, setSelectedCountry] = useState<Country>(
    initialCountry ?? fallbackCountry
  )

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
    [`phone-${selectedCountry.countryCode}`]: string()
      .required(t('Phone number is required'))
      .test(
        'phone-format',
        t('Phone number must be a valid format'),
        function (value) {
          // Validate that the complete phone number matches backend format: /^\+[1-9]\d{1,14}$/
          const countryCodeDigits = selectedCountry.callingCode.replace(
            /[-+]/g,
            ''
          )
          const fullPhoneNumber = `+${countryCodeDigits}${value}`
          const isValid = /^\+[1-9]\d{1,14}$/.test(fullPhoneNumber)
          return isValid
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

  function handleChange(country: Country): void {
    setSelectedCountry(country)
    setPhoneNumber('')
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
        countryCode: phoneAction?.countryCode ?? '',
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
        <TextFieldForm
          id={`phone-${selectedCountry.countryCode}`}
          label={t('Phone number')}
          type="tel"
          initialValue={phoneNumber}
          validationSchema={phoneActionSchema}
          onSubmit={handleSubmit}
          startIcon={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FlagDropdown
                countries={countries}
                selectedCountry={selectedCountry}
                onChange={handleChange}
              />
              <Box component="span" aria-hidden>
                ({selectedCountry.callingCode})
              </Box>
            </Box>
          }
        />
        <FormControl fullWidth>
          <RadioGroup
            aria-label={t('Contact action')}
            name="phone-contact-action"
            value={phoneAction?.contactAction ?? ContactActionType.call}
            onChange={(event) => {
              const value = (event.target as HTMLInputElement).value as keyof typeof ContactActionType
              if (value != null) {
                const enumValue = ContactActionType[value]
                if (enumValue != null) handleContactActionChange(enumValue)
              }
            }}
          >
             <Tooltip title={disableRadioAction ? t('Phone number is required') : ''} placement="right">
              <span>
                <FormControlLabel
                  value={ContactActionType.call}
                  control={<Radio />}
                  label={t('Call')}
                  disabled={disableRadioAction}
                  />
                </span>
              </Tooltip>
             <Tooltip title={disableRadioAction ? t('Phone number is required') : ''} placement="right">
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
