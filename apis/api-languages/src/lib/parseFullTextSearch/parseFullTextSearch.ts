export function parseFullTextSearch(value: string): string {
  // Regular expression to match special characters in tsquery
  const specialChars = /[&|!():/-\s]/g

  const words = value.trim().split(/\s+/)

  const processedWords = words.map((word) => {
    if (specialChars.test(word)) {
      return `"${word.replace(specialChars, '\\$&')}"`
    }

    return word
  })

  return processedWords.join(' & ')
}
