export function abbreviateLanguageName(name?: string): string | undefined {
  if (name == null) {
    return undefined
  }

  const specialCharIndex = name.search(/[,;:()]/)
  if (specialCharIndex === -1) {
    return name
  }

  const words = name
    .slice(specialCharIndex + 1)
    .split(/\s+/)
    .map((word) => word.trim())
  const abbreviation = words.map((word) => word[0]?.toUpperCase()).join('')

  const baseName = name.slice(0, specialCharIndex).trim()
  return abbreviation != null ? `${baseName} (${abbreviation})` : baseName
}
