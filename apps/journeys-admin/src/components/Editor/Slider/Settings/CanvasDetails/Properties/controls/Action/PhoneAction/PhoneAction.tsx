import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { object, string } from 'yup'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { useActionCommand } from '../../../../../../../utils/useActionCommand'
import { CountryCodeAutoComplete } from './CountryCodeAutoComplete'
import Stack from '@mui/material/Stack'
import { countries, CountryType } from './CountryCodeAutoComplete/countriesList'

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

  const initialCountry = countries.find(
    (country) => country.countryCode === phoneAction?.countryCode
  )

  const fallbackCountry =
    countries.find((country) => country.countryCode === 'US') ?? countries[0]

  const [selectedCountry, setSelectedCountry] = useState<CountryType>(
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
        countryCode: selectedCountry.countryCode
      },
      undoAction: action,
      editorFocus: {
        selectedStep,
        selectedBlock
      }
    })
  }

  function handleChange(country: CountryType): void {
    setSelectedCountry(country)
    setPhoneNumber('')
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
        <CountryCodeAutoComplete
          countries={countries.sort((a, b) => {
            return a.label.localeCompare(b.label)
          })}
          selectedCountry={selectedCountry}
          handleChange={handleChange}
        />
        <TextFieldForm
          id={`phone-${selectedCountry.countryCode}`}
          label={t('Phone number')}
          initialValue={phoneNumber}
          validationSchema={phoneActionSchema}
          onSubmit={handleSubmit}
          startIcon={selectedCountry?.callingCode}
        />
      </Stack>
    </>
  )
}
