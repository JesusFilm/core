export function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
  if (!match) return undefined
  const value = match.substring(name.length + 1)
  return value.includes('---') ? value.split('---')[1] : value
}

export function setCookie(name: string, value: string): void {
  const cookieFingerprint = '00005'
  document.cookie = `${name}=${cookieFingerprint}---${value}; path=/`
}
