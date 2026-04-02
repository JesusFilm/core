import { addTransferParam } from './addTransferParam'

describe('addTransferParam', () => {
  it('should add transfer=true to a simple path', () => {
    const result = addTransferParam('/templates/123/customize')
    expect(result).toBe('/templates/123/customize?transfer=true')
  })

  it('should append transfer=true to existing query params', () => {
    const result = addTransferParam(
      '/templates/123/customize?screen=text'
    )
    expect(result).toBe(
      '/templates/123/customize?screen=text&transfer=true'
    )
  })

  it('should replace existing transfer param', () => {
    const result = addTransferParam(
      '/templates/123/customize?transfer=false'
    )
    expect(result).toBe('/templates/123/customize?transfer=true')
  })

  it('should return the original URL on invalid input', () => {
    const result = addTransferParam('')
    expect(result).toBe('/?transfer=true')
  })
})
