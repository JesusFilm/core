import { JourneyFields as Journey } from '../JourneyProvider/__generated__/JourneyFields'

import { isJourneyCustomizable } from './isJourneyCustomizable'

describe('isJourneyCustomizable', () => {
  it('should return true when journey has valid customization description and fields', () => {
    const journey = {
      journeyCustomizationDescription: 'Customize this journey',
      journeyCustomizationFields: [
        { id: 'field1', __typename: 'JourneyCustomizationField' }
      ],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(true)
  })

  it('should return true when journey has blocks with customizable actions', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: '1',
          parentBlockId: null,
          parentOrder: 0,
          label: 'Test Button',
          buttonVariant: null,
          buttonColor: null,
          size: null,
          startIconId: null,
          endIconId: null,
          submitEnabled: null,
          action: {
            __typename: 'LinkAction',
            parentBlockId: '1',
            gtmEventName: null,
            url: 'https://example.com',
            customizable: true,
            parentStepId: null
          },
          settings: null
        }
      ]
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(true)
  })

  it('should return true when journey has both editable text and customizable links', () => {
    const journey = {
      journeyCustomizationDescription: 'Customize this journey',
      journeyCustomizationFields: [
        { id: 'field1', __typename: 'JourneyCustomizationField' }
      ],
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: '1',
          parentBlockId: null,
          parentOrder: 0,
          label: 'Test Button',
          buttonVariant: null,
          buttonColor: null,
          size: null,
          startIconId: null,
          endIconId: null,
          submitEnabled: null,
          action: {
            __typename: 'LinkAction',
            parentBlockId: '1',
            gtmEventName: null,
            url: 'https://example.com',
            customizable: true,
            parentStepId: null
          },
          settings: null
        }
      ]
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(true)
  })

  it('should return false when journey has no customization capabilities', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(false)
  })

  it('should return false when journeyCustomizationDescription is null', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [
        { id: 'field1', __typename: 'JourneyCustomizationField' }
      ],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(false)
  })

  it('should return false when journeyCustomizationDescription is empty string', () => {
    const journey = {
      journeyCustomizationDescription: '',
      journeyCustomizationFields: [
        { id: 'field1', __typename: 'JourneyCustomizationField' }
      ],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(false)
  })

  it('should return false when journeyCustomizationDescription is only whitespace', () => {
    const journey = {
      journeyCustomizationDescription: '   ',
      journeyCustomizationFields: [
        { id: 'field1', __typename: 'JourneyCustomizationField' }
      ],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(false)
  })

  it('should return false when journeyCustomizationFields is empty', () => {
    const journey = {
      journeyCustomizationDescription: 'Customize this journey',
      journeyCustomizationFields: [],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(false)
  })

  it('should return false when journeyCustomizationFields is null', () => {
    const journey = {
      journeyCustomizationDescription: 'Customize this journey',
      journeyCustomizationFields: null as any,
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(false)
  })

  it('should return false when journey is undefined', () => {
    const result = isJourneyCustomizable(undefined)

    expect(result).toBe(false)
  })

  it('should return false when journey has blocks with non-customizable actions', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: '1',
          parentBlockId: null,
          parentOrder: 0,
          label: 'Test Button',
          buttonVariant: null,
          buttonColor: null,
          size: null,
          startIconId: null,
          endIconId: null,
          submitEnabled: null,
          action: {
            __typename: 'LinkAction',
            parentBlockId: '1',
            gtmEventName: null,
            url: 'https://example.com',
            customizable: false,
            parentStepId: null
          },
          settings: null
        }
      ]
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(false)
  })

  it('should return false when journey has blocks with null actions', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: '1',
          parentBlockId: null,
          parentOrder: 0,
          label: 'Test Button',
          buttonVariant: null,
          buttonColor: null,
          size: null,
          startIconId: null,
          endIconId: null,
          submitEnabled: null,
          action: null,
          settings: null
        }
      ]
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(false)
  })

  it('should return false when journey has blocks with unsupported block types', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      blocks: [
        {
          __typename: 'TextBlock',
          id: '1',
          parentBlockId: null,
          parentOrder: 0,
          content: 'Some text',
          settings: null
        }
      ]
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toBe(false)
  })

  describe('hasCustomizableMedia', () => {
    it('should return false when journey has only customizable media and customizableMedia option is not set', () => {
      const journey = {
        journeyCustomizationDescription: null,
        journeyCustomizationFields: [],
        blocks: [
          {
            __typename: 'ImageBlock',
            id: 'img-1',
            parentBlockId: null,
            parentOrder: 0,
            src: null,
            alt: '',
            width: 0,
            height: 0,
            blurhash: '',
            scale: null,
            focalTop: null,
            focalLeft: null,
            customizable: true
          }
        ]
      } as unknown as Journey

      expect(isJourneyCustomizable(journey)).toBe(false)
      expect(isJourneyCustomizable(journey, false)).toBe(false)
    })

    it('should return true when journey has only customizable media and customizableMedia option is true', () => {
      const journey = {
        journeyCustomizationDescription: null,
        journeyCustomizationFields: [],
        blocks: [
          {
            __typename: 'ImageBlock',
            id: 'img-1',
            parentBlockId: null,
            parentOrder: 0,
            src: null,
            alt: '',
            width: 0,
            height: 0,
            blurhash: '',
            scale: null,
            focalTop: null,
            focalLeft: null,
            customizable: true
          }
        ]
      } as unknown as Journey

      expect(isJourneyCustomizable(journey, true)).toBe(true)
    })

    it('should return false when journey has no customization and customizableMedia option is true', () => {
      const journey = {
        journeyCustomizationDescription: null,
        journeyCustomizationFields: [],
        blocks: []
      } as unknown as Journey

      expect(isJourneyCustomizable(journey, true)).toBe(false)
    })
  })
})
