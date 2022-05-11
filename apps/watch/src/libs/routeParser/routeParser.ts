interface RouteParserResult {
  routes: string[] | undefined
  tags: string[]
  audioLanguage: number
  subtitleLanguage: number
}

function isModifier(s: string): boolean {
  return ['al', 'sl', 't'].includes(s)
}
export function routeParser(
  input: string | string[] | undefined
): RouteParserResult {
  const result: RouteParserResult = {
    routes: [],
    tags: [],
    audioLanguage: 529,
    subtitleLanguage: 529
  }
  if (input == null || !Array.isArray(input)) return result

  for (let i = 0; i < input.length; i++) {
    const item = input[i]
    if (isModifier(item)) {
      const nextItem = input[i + 1]
      if (nextItem == null || isModifier(nextItem)) continue
      i++
      switch (item) {
        case 'al':
          result.audioLanguage = Number(nextItem)
          break
        case 'sl':
          result.subtitleLanguage = Number(nextItem)
          break
        case 't':
          result.tags.push(nextItem)
          break
      }
    } else {
      result.routes?.push(item)
    }
  }
  return result
}
