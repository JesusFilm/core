import { TranslatedValueRef } from '../translatedValue'

import {
  type CampaignBlockFieldBuilder,
  translationsField
} from './translationsField'

const FRENCH = '496'
const SPANISH = '21028'
const GERMAN = '1106'

interface FieldConfig {
  type: unknown
  nullable: boolean
  resolve: (block: Record<string, unknown>) => unknown
}

/** A `t` that hands back the config `translationsField` passes to `t.field`. */
function fieldConfigOf(
  column: Parameters<typeof translationsField>[1]
): FieldConfig {
  const t = {
    field: (config: FieldConfig) => config
  } as unknown as CampaignBlockFieldBuilder
  return translationsField(t, column) as unknown as FieldConfig
}

describe('translationsField', () => {
  it('is a non-null TranslatedValue list', () => {
    const config = fieldConfigOf('title')

    expect(config.type).toEqual([TranslatedValueRef])
    expect(config.nullable).toBe(false)
  })

  it('reads the column’s own translations sibling', () => {
    const config = fieldConfigOf('description')

    expect(
      config.resolve({
        titleTranslations: { [FRENCH]: { value: 'Titre', source: 'human' } },
        descriptionTranslations: {
          [FRENCH]: { value: 'Choisissez', source: 'machine' }
        }
      })
    ).toEqual([{ languageId: FRENCH, value: 'Choisissez', source: 'machine' }])
  })

  it('drops an empty or non-string entry and reads an unknown source as human', () => {
    const config = fieldConfigOf('title')

    expect(
      config.resolve({
        titleTranslations: {
          [FRENCH]: { value: '', source: 'machine' },
          [SPANISH]: { value: 42, source: 'machine' },
          [GERMAN]: { value: 'Teile die Geschichte', source: 'robot' }
        }
      })
    ).toEqual([
      { languageId: GERMAN, value: 'Teile die Geschichte', source: 'human' }
    ])
  })

  it('lists nothing for a null or malformed column', () => {
    const config = fieldConfigOf('title')

    expect(config.resolve({ titleTranslations: null })).toEqual([])
    expect(config.resolve({ titleTranslations: ['Titre'] })).toEqual([])
  })
})
