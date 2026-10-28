import {
  canChangeDestination,
  canDeleteLink,
  getDefaultErrorCorrection,
  getDestinationChangeRule,
  isDestinationChanged,
  validateDestinationChange
} from './protection'

describe('getDestinationChangeRule', () => {
  it('lets editors change standard links without ceremony', () => {
    expect(getDestinationChangeRule('standard')).toEqual({
      requiresAdmin: false,
      requiresConfirmation: false,
      requiresNote: false
    })
  })

  it('requires an admin and a confirmation for permanent links', () => {
    expect(getDestinationChangeRule('permanent')).toEqual({
      requiresAdmin: true,
      requiresConfirmation: true,
      requiresNote: false
    })
  })

  it('requires an admin, a confirmation and a note for video-embedded links', () => {
    expect(getDestinationChangeRule('videoEmbedded')).toEqual({
      requiresAdmin: true,
      requiresConfirmation: true,
      requiresNote: true
    })
  })
})

describe('canChangeDestination', () => {
  it('blocks editors on protected classes only', () => {
    expect(canChangeDestination('standard', false)).toBe(true)
    expect(canChangeDestination('permanent', false)).toBe(false)
    expect(canChangeDestination('videoEmbedded', false)).toBe(false)
    expect(canChangeDestination('videoEmbedded', true)).toBe(true)
  })
})

describe('canDeleteLink', () => {
  it('blocks editors from deleting protected classes', () => {
    expect(canDeleteLink('standard', false)).toBe(true)
    expect(canDeleteLink('permanent', false)).toBe(false)
    expect(canDeleteLink('permanent', true)).toBe(true)
  })
})

describe('validateDestinationChange', () => {
  it('requires a note for video-embedded links', () => {
    expect(validateDestinationChange('videoEmbedded', '')).toEqual({
      noteError: 'A change note is required for video-embedded links'
    })
    expect(validateDestinationChange('videoEmbedded', '   ')).toEqual({
      noteError: 'A change note is required for video-embedded links'
    })
    expect(validateDestinationChange('videoEmbedded', 'moved')).toEqual({})
  })

  it('does not require a note otherwise', () => {
    expect(validateDestinationChange('permanent', '')).toEqual({})
    expect(validateDestinationChange('standard', '')).toEqual({})
  })
})

describe('isDestinationChanged', () => {
  it('ignores surrounding whitespace', () => {
    expect(isDestinationChanged('https://a.b', ' https://a.b ')).toBe(false)
    expect(isDestinationChanged('https://a.b', 'https://a.c')).toBe(true)
  })
})

describe('getDefaultErrorCorrection', () => {
  it('defaults to H for video-embedded and M otherwise', () => {
    expect(getDefaultErrorCorrection('videoEmbedded')).toBe('H')
    expect(getDefaultErrorCorrection('permanent')).toBe('M')
    expect(getDefaultErrorCorrection('standard')).toBe('M')
  })
})
