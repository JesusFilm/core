const vttTagPattern = /<[^>]+>/g

export function normalizeCueText(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')
  const cleanedLines = lines.map((line) => line.trim().replace(/\s+/g, ' '))
  return cleanedLines.join('\n').trim()
}

export function stripVttTags(text: string): string {
  return text.replace(vttTagPattern, '')
}

interface SegmenterInstance {
  segment(value: string): Iterable<unknown>
}

interface SegmenterConstructor {
  new (
    locales?: string | string[],
    options?: { granularity: 'grapheme' }
  ): SegmenterInstance
}

export function countGraphemes(text: string): number {
  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterConstructor })
    .Segmenter
  if (Segmenter != null) {
    const segmenter = new Segmenter(undefined, { granularity: 'grapheme' })
    let count = 0
    for (const segment of segmenter.segment(text)) {
      void segment
      count += 1
    }
    return count
  }

  return Array.from(text).length
}

export function countChars(text: string): number {
  const withoutNewlines = text.replace(/\n/g, '')
  return countGraphemes(withoutNewlines)
}
