import { Block } from '.prisma/api-journeys-modern-client'

import { getButtonBlockContent } from './getButtonBlockContent'

describe('getButtonBlockContent', () => {
  it('includes block id and label in output', () => {
    const block = {
      id: 'b1',
      typename: 'ButtonBlock',
      label: 'Click me'
    } as Block
    const result = getButtonBlockContent({ block })
    expect(result).toContain('Block ID: b1')
    expect(result).toContain('Button Label: Click me')
  })

  it('handles null label gracefully', () => {
    const block = { id: 'b2', typename: 'ButtonBlock', label: null } as Block
    const result = getButtonBlockContent({ block })
    expect(result).toContain('Block ID: b2')
    expect(result).toContain('Button Label: null')
  })

  it('handles undefined label gracefully', () => {
    const block = { id: 'b3', typename: 'ButtonBlock' } as Block
    const result = getButtonBlockContent({ block })
    expect(result).toContain('Block ID: b3')
    expect(result).toContain('Button Label: undefined')
  })
})
