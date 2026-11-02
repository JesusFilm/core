import type { LanguageModel } from 'ai'

import { generateJson } from '../generateJson'
import { IMAGE_CHOICE_INSTRUCTIONS } from '../stages/prompts'
import { imageChoiceSchema } from '../stages/stageSchemas'

import type { ImageNeed } from './resolveImages'

/**
 * One small model call per run that picks a photo for every new image from
 * its candidates' Unsplash descriptions. Whether Qwen can see images is not
 * known yet, so it chooses from text only.
 */
export async function choosePhotos(
  model: LanguageModel,
  abortSignal: AbortSignal,
  needs: ImageNeed[]
): Promise<Record<string, number>> {
  const prompt = needs
    .map((need) =>
      [
        `Image ${need.name}: search "${need.search}", alt "${need.alt}"`,
        ...need.candidates.map(
          (candidate, index) =>
            `  ${index}: ${candidate.description === '' ? '(no description)' : candidate.description}`
        )
      ].join('\n')
    )
    .join('\n\n')

  const result = await generateJson({
    model,
    abortSignal,
    instructions: IMAGE_CHOICE_INSTRUCTIONS,
    prompt,
    schema: imageChoiceSchema
  })
  if (!result.ok) return {}
  return Object.fromEntries(
    result.value.choices.map((choice) => [choice.name, choice.index])
  )
}
