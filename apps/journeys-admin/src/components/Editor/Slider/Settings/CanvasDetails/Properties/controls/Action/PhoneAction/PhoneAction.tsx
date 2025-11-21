import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActionBlock, isActionBlock } from '@core/journeys/ui/isActionBlock'

import { ContactActionType } from '../../../../../../../../../../__generated__/globalTypes'
import type { TextFieldFormRef } from '../../../../../../../../TextFieldForm'
import { useActionCommand } from '../../../../../../../utils/useActionCommand'

import { countries } from './countriesList'
import { PhoneField } from './PhoneField/PhoneField'
import { getFullPhoneNumber } from './utils/getFullPhoneNumber'
import { normalizeCallingCode } from './utils/normalizeCallingCode'

export function PhoneAction(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep }
  } = useEditor()
  const selectedBlock =
    stateSelectedBlock && isActionBlock(stateSelectedBlock)
      ? (stateSelectedBlock as ActionBlock)
      : undefined
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

  // Check if radio buttons should be disabled
  const disableRadioAction = useMemo(
    () => !phoneAction?.phone || phoneAction.phone.trim() === '',
    [phoneAction?.phone]
  )

  // Sync callingCode when phoneAction changes
  useEffect(() => {
    if (!phoneAction?.countryCode) {
      setCallingCode('+')
      return
    }
    const country = countries.find(
      (c) => c.countryCode === phoneAction.countryCode
    )
    setCallingCode(country?.callingCode ?? '+')
  }, [phoneAction?.countryCode])

  // Sync phoneNumber when phoneAction changes
  useEffect(() => {
    if (!phoneAction?.phone) {
      setPhoneNumber('')
      return
    }
    const country = countries.find(
      (c) => c.countryCode === phoneAction.countryCode
    )
    const digits = country?.callingCode?.replace(/[^\d]/g, '') ?? ''
    const prefix = digits === '' ? '' : `+${digits}`
    const localNumber = phoneAction.phone.startsWith(prefix)
      ? phoneAction.phone.slice(prefix.length)
      : phoneAction.phone.replace(/^\+/, '')
    setPhoneNumber(localNumber)
  }, [phoneAction?.phone, phoneAction?.countryCode])

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
      if (hasValidCallingCode && hasValidPhoneNumber && selectedStep != null) {
        const selectedCountryForAction = findCountryByCallingCode(
          normalizedCallingCode,
          phoneAction?.countryCode
        )
        const fullPhoneNumber = getFullPhoneNumber(
          selectedCountryForAction.callingCode,
          phoneNumberValue
        )

        addAction({
          blockId: selectedBlock.id,
          blockTypename: selectedBlock.__typename,
          action: {
            __typename: 'PhoneAction',
            parentBlockId: selectedBlock.id,
            gtmEventName: '',
            phone: fullPhoneNumber,
            countryCode: selectedCountryForAction.countryCode,
            contactAction: phoneAction?.contactAction ?? ContactActionType.call,
            customizable: phoneAction?.customizable ?? false,
            parentStepId: selectedStep.id
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
    [phoneNumber, validateAndSubmit]
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
      if (
        !selectedBlock ||
        disableRadioAction ||
        !phoneAction ||
        selectedStep == null
      )
        return

      addAction({
        blockId: selectedBlock.id,
        blockTypename: selectedBlock.__typename,
        action: {
          __typename: 'PhoneAction',
          parentBlockId: selectedBlock.id,
          gtmEventName: '',
          phone: phoneAction.phone,
          countryCode: phoneAction.countryCode ?? 'US',
          contactAction,
          customizable: phoneAction.customizable ?? false,
          parentStepId: selectedStep.id
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
        <PhoneField
          callingCodeRef={callingCodeRef}
          phoneNumberRef={phoneNumberRef}
          callingCode={callingCode}
          phoneNumber={phoneNumber}
          handleCallingCodeChange={handleCallingCodeChange}
          handlePhoneNumberChange={handlePhoneNumberChange}
        />
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
