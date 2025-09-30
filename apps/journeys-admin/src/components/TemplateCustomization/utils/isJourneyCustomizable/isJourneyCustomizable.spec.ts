import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'

import { isJourneyCustomizable } from './isJourneyCustomizable'

describe('isJourneyCustomizable', () => {
  it('should return false for both when journey has no customization capabilities', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toEqual({
      hasEditableText: false,
      hasCustomizableLinks: false
    })
  })

  it('should return true for hasEditableText when journey has valid customization description and fields', () => {
    const journey = {
      journeyCustomizationDescription: 'Customize this journey',
      journeyCustomizationFields: [
        { id: 'field1', __typename: 'JourneyCustomizationField' }
      ],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toEqual({
      hasEditableText: true,
      hasCustomizableLinks: false
    })
  })

  it('should return false for hasEditableText when journeyCustomizationDescription is null', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [
        { id: 'field1', __typename: 'JourneyCustomizationField' }
      ],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toEqual({
      hasEditableText: false,
      hasCustomizableLinks: false
    })
  })

  it('should return false for hasEditableText when journeyCustomizationDescription is empty string', () => {
    const journey = {
      journeyCustomizationDescription: '',
      journeyCustomizationFields: [
        { id: 'field1', __typename: 'JourneyCustomizationField' }
      ],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toEqual({
      hasEditableText: false,
      hasCustomizableLinks: false
    })
  })

  it('should return false for hasEditableText when journeyCustomizationDescription is only whitespace', () => {
    const journey = {
      journeyCustomizationDescription: '   ',
      journeyCustomizationFields: [
        { id: 'field1', __typename: 'JourneyCustomizationField' }
      ],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toEqual({
      hasEditableText: false,
      hasCustomizableLinks: false
    })
  })

  it('should return false for hasEditableText when journeyCustomizationFields is empty', () => {
    const journey = {
      journeyCustomizationDescription: 'Customize this journey',
      journeyCustomizationFields: [],
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toEqual({
      hasEditableText: false,
      hasCustomizableLinks: false
    })
  })

  it('should return false for hasEditableText when journeyCustomizationFields is null', () => {
    const journey = {
      journeyCustomizationDescription: 'Customize this journey',
      journeyCustomizationFields: null as any,
      blocks: []
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toEqual({
      hasEditableText: false,
      hasCustomizableLinks: false
    })
  })

  it('should return true for hasCustomizableLinks when journey has blocks with customizable actions', () => {
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

    expect(result).toEqual({
      hasEditableText: false,
      hasCustomizableLinks: true
    })
  })

  it('should return true for both when journey has both editable text and customizable links', () => {
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

    expect(result).toEqual({
      hasEditableText: true,
      hasCustomizableLinks: true
    })
  })

  it('should handle undefined blocks by defaulting to empty array', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      blocks: undefined
    } as unknown as Journey

    const result = isJourneyCustomizable(journey)

    expect(result).toEqual({
      hasEditableText: false,
      hasCustomizableLinks: false
    })
  })
})
