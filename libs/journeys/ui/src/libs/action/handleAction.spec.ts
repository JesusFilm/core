import { NextRouter } from 'next/dist/client/router'
import { nextActiveBlock } from '..'
import { handleAction } from '.'

jest.mock('../useBlocks/blocks', () => {
  const originalModule = jest.requireActual('../useBlocks/blocks')
  return {
    __esModule: true,
    ...originalModule,
    nextActiveBlock: jest.fn()
  }
})

describe('handleAction', () => {
  let router: NextRouter
  beforeEach(() => {
    router = {
      push: jest.fn()
    } as unknown as NextRouter
  })

  const editorMode = false

  it('should handle empty action', () => {
    expect(() => handleAction(router, editorMode)).not.toThrowError()
  })

  it('should handle NavigateToBlockAction', () => {
    handleAction(router, editorMode, {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'parent-id',
      blockId: 'block-id',
      gtmEventName: null
    })
    expect(nextActiveBlock).toHaveBeenCalledWith({ id: 'block-id' })
  })

  it('should handle NavigateToJourneyAction', () => {
    handleAction(router, editorMode, {
      __typename: 'NavigateToJourneyAction',
      parentBlockId: 'parent-id',
      journey: {
        __typename: 'Journey',
        id: 'journey-id',
        slug: 'journey-slug'
      },
      gtmEventName: null
    })
    expect(router.push).toHaveBeenCalledWith('/journey-slug')
  })

  it('should handle NavigateToJourneyAction when journey is null', () => {
    expect(() =>
      handleAction(router, editorMode, {
        __typename: 'NavigateToJourneyAction',
        parentBlockId: 'parent-id',
        journey: null,
        gtmEventName: null
      })
    ).not.toThrowError()
  })

  it('should handle NavigateAction', () => {
    handleAction(router, editorMode, {
      __typename: 'NavigateAction',
      parentBlockId: 'parent-id',
      gtmEventName: null
    })
    expect(nextActiveBlock).toHaveBeenCalledWith()
  })

  it('should handle LinkAction', () => {
    handleAction(router, editorMode, {
      __typename: 'LinkAction',
      parentBlockId: 'parent-id',
      gtmEventName: null,
      url: 'https://www.google.com'
    })
    expect(router.push).toHaveBeenCalledWith('https://www.google.com')
  })

  it('should not handle Link Action, when in editor mode', () => {
    const editorMode = true
    handleAction(router, editorMode, {
      __typename: 'LinkAction',
      parentBlockId: 'parent-id',
      gtmEventName: null,
      url: 'https://www.google.com'
    })
    expect(router.push).not.toHaveBeenCalled()
  })

  it('should not handle Navigate to Journey Action, when in editor mode', () => {
    const editorMode = true
    handleAction(router, editorMode, {
      __typename: 'NavigateAction',
      parentBlockId: 'parent-id',
      gtmEventName: null
    })
    expect(router.push).not.toHaveBeenCalled()
  })
})
