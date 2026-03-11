import { prismaMock } from '../../../test/prismaMock'

import { recalculateJourneyCustomizable } from './recalculateJourneyCustomizable'

describe('recalculateJourneyCustomizable', () => {
  const baseJourney = {
    template: true,
    customizable: false,
    journeyCustomizationDescription: null,
    logoImageBlockId: null,
    website: null,
    _count: { journeyCustomizationFields: 0 }
  }

  it('should early return if journey not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce(null)
    await recalculateJourneyCustomizable('non-existent')
    expect(prismaMock.block.findMany).not.toHaveBeenCalled()
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should early return for non-template journeys', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...baseJourney,
      template: false
    } as any)
    await recalculateJourneyCustomizable('journeyId')
    expect(prismaMock.block.findMany).not.toHaveBeenCalled()
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should set customizable to true when has editable text fields', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...baseJourney,
      journeyCustomizationDescription: 'Hello {{ name: John }}!',
      _count: { journeyCustomizationFields: 1 }
    } as any)
    prismaMock.block.findMany.mockResolvedValueOnce([])

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).toHaveBeenCalledWith({
      where: { id: 'journeyId' },
      data: { customizable: true }
    })
  })

  it('should not count editable text when description is empty', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...baseJourney,
      journeyCustomizationDescription: '',
      _count: { journeyCustomizationFields: 1 }
    } as any)
    prismaMock.block.findMany.mockResolvedValueOnce([])

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should not count editable text when fields count is 0', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...baseJourney,
      journeyCustomizationDescription: 'Has description'
    } as any)
    prismaMock.block.findMany.mockResolvedValueOnce([])

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should set customizable to true when has customizable link action on ButtonBlock', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce(baseJourney as any)
    prismaMock.block.findMany.mockResolvedValueOnce([
      {
        id: 'buttonId',
        typename: 'ButtonBlock',
        customizable: false,
        action: {
          parentBlockId: 'buttonId',
          customizable: true,
          blockId: null,
          url: 'https://example.com'
        }
      }
    ] as any)

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).toHaveBeenCalledWith({
      where: { id: 'journeyId' },
      data: { customizable: true }
    })
  })

  it('should not count NavigateToBlockAction as customizable link', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce(baseJourney as any)
    prismaMock.block.findMany.mockResolvedValueOnce([
      {
        id: 'buttonId',
        typename: 'ButtonBlock',
        customizable: false,
        action: {
          parentBlockId: 'buttonId',
          customizable: true,
          blockId: 'stepBlockId',
          url: null
        }
      }
    ] as any)

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should set customizable to true when has customizable ImageBlock', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce(baseJourney as any)
    prismaMock.block.findMany.mockResolvedValueOnce([
      {
        id: 'imageId',
        typename: 'ImageBlock',
        customizable: true,
        action: null
      }
    ] as any)

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).toHaveBeenCalledWith({
      where: { id: 'journeyId' },
      data: { customizable: true }
    })
  })

  it('should count logo as customizable media when website is true', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...baseJourney,
      website: true,
      logoImageBlockId: 'logoId'
    } as any)
    prismaMock.block.findMany.mockResolvedValueOnce([
      {
        id: 'logoId',
        typename: 'ImageBlock',
        customizable: true,
        action: null
      }
    ] as any)

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).toHaveBeenCalledWith({
      where: { id: 'journeyId' },
      data: { customizable: true }
    })
  })

  it('should not count logo as customizable media when website is false', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...baseJourney,
      website: false,
      logoImageBlockId: 'logoId'
    } as any)
    prismaMock.block.findMany.mockResolvedValueOnce([
      {
        id: 'logoId',
        typename: 'ImageBlock',
        customizable: true,
        action: null
      }
    ] as any)

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should set customizable to false when no customizable content', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...baseJourney,
      customizable: true
    } as any)
    prismaMock.block.findMany.mockResolvedValueOnce([
      {
        id: 'imageId',
        typename: 'ImageBlock',
        customizable: false,
        action: null
      }
    ] as any)

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).toHaveBeenCalledWith({
      where: { id: 'journeyId' },
      data: { customizable: false }
    })
  })

  it('should not update when value unchanged', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...baseJourney,
      customizable: false
    } as any)
    prismaMock.block.findMany.mockResolvedValueOnce([])

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  it('should detect customizable RadioOptionBlock action', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce(baseJourney as any)
    prismaMock.block.findMany.mockResolvedValueOnce([
      {
        id: 'radioId',
        typename: 'RadioOptionBlock',
        customizable: false,
        action: {
          parentBlockId: 'radioId',
          customizable: true,
          blockId: null,
          url: 'https://example.com'
        }
      }
    ] as any)

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).toHaveBeenCalledWith({
      where: { id: 'journeyId' },
      data: { customizable: true }
    })
  })

  it('should handle null customizable on journey as false', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      ...baseJourney,
      customizable: null
    } as any)
    prismaMock.block.findMany.mockResolvedValueOnce([])

    await recalculateJourneyCustomizable('journeyId')

    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })
})
