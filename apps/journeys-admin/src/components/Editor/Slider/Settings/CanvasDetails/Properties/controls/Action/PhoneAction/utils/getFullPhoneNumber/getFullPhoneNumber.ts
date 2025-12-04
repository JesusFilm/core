import { normalizeCallingCode } from '../normalizeCallingCode'

export function getFullPhoneNumber(
  callingCode: string,
  phoneNumber: string
): string {
  const rawCallingCode = callingCode ?? ''
  const rawLocalNumber = phoneNumber ?? ''

  if (rawLocalNumber.trim().startsWith('+')) {
    const digits = rawLocalNumber.replace(/[^\d]/g, '')
    return digits === '' ? '' : `+${digits}`
  }

  const normalizedCallingCode = normalizeCallingCode(rawCallingCode)

  const callingCodeDigits = normalizedCallingCode.replace(/[^\d]/g, '')
  const localDigits = rawLocalNumber.replace(/[^\d]/g, '')

  if (callingCodeDigits === '' && localDigits === '') return ''

  return `+${callingCodeDigits}${localDigits}`
}
