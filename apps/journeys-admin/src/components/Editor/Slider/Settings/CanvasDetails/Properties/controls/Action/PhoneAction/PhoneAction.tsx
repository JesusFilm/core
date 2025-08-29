import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
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

  const initialPhoneNumber = phoneAction?.phone?.substring(
    selectedCountry.callingCode.replace('-', '').length
  )
  console.log('selectedCountry', selectedCountry)
  console.log('callingCode', selectedCountry.callingCode.replace('-', ''))
  console.log('rawPhoneNumber', phoneAction?.phone)
  console.log('initialPhoneNumber', initialPhoneNumber)

  const phoneActionSchema = object({
    phone: string()
      .required(t('Phone number is required'))
      .test(
        'phone-format',
        t('Phone number must be a valid format'),
        function (value) {
          if (!value) return false
          // Backend expects: +[1-9]\d{1,14} (total 2-15 chars)
          // So phone part can be at most: 15 - callingCode.length chars
          const maxPhoneLength = 15 - selectedCountry.callingCode.length
          const minPhoneLength = 1
          return (
            /^\d+$/.test(value) &&
            value.length >= minPhoneLength &&
            value.length <= maxPhoneLength
          )
        }
      )
  })

  function handleSubmit(phone: string): void {
    if (selectedBlock == null) return
    const cleanCallingCode = selectedCountry.callingCode.replace('-', '')
    const fullPhoneNumber = `${cleanCallingCode}${phone}`
    console.log('fullPhoneNumber', fullPhoneNumber)

    const { id, action, __typename: blockTypename } = selectedBlock

    console.log('submit phone action', phone)
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
          countries={countries}
          selectedCountry={selectedCountry}
          handleChange={handleChange}
        />
        <TextFieldForm
          id="phone"
          label={t('Phone number')}
          initialValue={initialPhoneNumber}
          validationSchema={phoneActionSchema}
          onSubmit={handleSubmit}
          startIcon={selectedCountry?.callingCode}
        />
      </Stack>
    </>
  )
}
