import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { getTemplateCustomizationFields } from './getTemplateCustomizationFields'

describe('getTemplateCustomizationFields', () => {
  it('returns empty array when journey is undefined', () => {
    expect(getTemplateCustomizationFields(undefined)).toEqual([])
  })

  it('returns empty array when journey has no blocks', () => {
    const journey = { blocks: [] } as unknown as Journey
    expect(getTemplateCustomizationFields(journey)).toEqual([])
  })

  it('extracts de-duplicated field names from supported block properties', () => {
    const journey = {
      blocks: [
        {
          __typename: 'TypographyBlock',
          content: 'Hi {{ firstName }} and {{lastName}}!'
        },
        { __typename: 'ButtonBlock', label: 'Go to {{ nextStep }}' },
        {
          __typename: 'TextResponseBlock',
          label: 'Enter {{ email }}',
          placeholder: '{{ company }}',
          hint: 'Hint {{ email }}'
        },
        { __typename: 'RadioOptionBlock', label: 'Pick {{ option }}' },
        { __typename: 'SignUpBlock', submitLabel: 'Submit {{ email }}' }
      ]
    } as unknown as Journey

    expect(getTemplateCustomizationFields(journey)).toEqual([
      'firstName',
      'lastName',
      'nextStep',
      'email',
      'company',
      'option'
    ])
  })
})
