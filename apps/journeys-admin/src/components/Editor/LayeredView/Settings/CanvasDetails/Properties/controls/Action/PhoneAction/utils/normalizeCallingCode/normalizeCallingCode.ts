export function normalizeCallingCode(code: string): string {
  if (code === '') return ''
  return code.startsWith('+') ? code : `+${code}`
}
