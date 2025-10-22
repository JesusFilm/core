import type { GeneratedStepContent } from '../../libs/storage'

export const normalizeGeneratedSteps = (
  steps: Array<
    Partial<GeneratedStepContent> & { title?: string; keywords?: string | string[] }
  >
): GeneratedStepContent[] =>
  steps.map((step) => {
    const keywordsValue = step?.keywords as string | string[] | undefined
    const normalizedKeywords = Array.isArray(keywordsValue)
      ? keywordsValue
          .map((keyword) =>
            typeof keyword === 'string' ? keyword.trim() : String(keyword ?? '').trim()
          )
          .filter((keyword) => keyword.length > 0)
          .slice(0, 3)
      : typeof keywordsValue === 'string'
      ? keywordsValue
          .split(',')
          .map((keyword) => keyword.trim())
          .filter((keyword) => keyword.length > 0)
          .slice(0, 3)
      : []

    const rawTitle = typeof step?.title === 'string' ? step.title.trim() : ''

    let content = typeof step?.content === 'string' ? step.content.trim() : ''

    if (rawTitle) {
      if (!content) {
        content = `# ${rawTitle}`
      } else {
        const firstMeaningfulLine =
          content
            .split('\n')
            .map((line) => line.trim())
            .find((line) => line.length > 0) ?? ''

        if (!/^#{1,6}\s+/.test(firstMeaningfulLine)) {
          content = `# ${rawTitle}\n\n${content}`.trim()
        }
      }
    }

    const mediaPrompt =
      typeof step?.mediaPrompt === 'string' ? step.mediaPrompt.trim() : ''

    return {
      content,
      keywords: normalizedKeywords,
      mediaPrompt
    }
  })

export const parseGeneratedSteps = (
  rawContent: string
): GeneratedStepContent[] => {
  if (!rawContent) return []

  let preparedContent = rawContent.trim()
  const codeBlockMatch = preparedContent.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (codeBlockMatch?.[1]) {
    preparedContent = codeBlockMatch[1].trim()
  }

  try {
    const parsed = JSON.parse(preparedContent)
    const stepsArray = Array.isArray(parsed?.steps)
      ? parsed.steps
      : Array.isArray(parsed)
        ? parsed
        : []

    if (Array.isArray(stepsArray) && stepsArray.length > 0) {
      return normalizeGeneratedSteps(stepsArray as GeneratedStepContent[])
    }
  } catch (error) {
    console.warn(
      'Failed to parse structured multi-step content. Falling back to default format.',
      error
    )
  }

  const fallbackSteps: GeneratedStepContent[] = []
  const stepRegex = /(Step\s+\d+\s*[:-]?)([\s\S]*?)(?=(?:\nStep\s+\d+\s*[:-]?\b)|$)/gi
  let match = stepRegex.exec(preparedContent)
  if (match) {
    stepRegex.lastIndex = 0
    let fallbackIndex = 0
    while ((match = stepRegex.exec(preparedContent)) !== null) {
      const [, rawTitle, rawBody] = match
      const normalizedTitle =
        rawTitle?.replace(/[:-]+$/, '').trim() || `Step ${fallbackIndex + 1}`
      const normalizedBody = rawBody?.trim() || ''
      fallbackSteps.push({
        content: normalizedTitle
          ? `# ${normalizedTitle}\n\n${normalizedBody}`.trim()
          : normalizedBody,
        keywords: [],
        mediaPrompt: ''
      })
      fallbackIndex += 1
    }
  }

  if (fallbackSteps.length > 0) {
    return normalizeGeneratedSteps(fallbackSteps)
  }

  return normalizeGeneratedSteps([
    {
      content: rawContent.trim(),
      keywords: [],
      mediaPrompt: ''
    }
  ])
}
