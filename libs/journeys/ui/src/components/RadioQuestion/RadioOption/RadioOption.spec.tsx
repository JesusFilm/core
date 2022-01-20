import { fireEvent, render } from '@testing-library/react'
import { TreeBlock, handleAction, EditorProvider } from '../../..'
import { RadioOption } from './RadioOption'
import { RadioOptionFields } from './__generated__/RadioOptionFields'

jest.mock('../../../libs/action', () => {
  const originalModule = jest.requireActual('../../../libs/action')
  return {
    __esModule: true,
    ...originalModule,
    handleAction: jest.fn()
  }
})

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: () => null
    }
  }
}))

const block: TreeBlock<RadioOptionFields> = {
  __typename: 'RadioOptionBlock',
  id: 'RadioOption1',
  label: 'Option 1',
  parentBlockId: 'RadioQuestion1',
  action: {
    __typename: 'NavigateToBlockAction',
    gtmEventName: 'gtmEventName',
    blockId: 'def'
  },
  children: []
}

describe('RadioOption', () => {
  it('should handle onClick', () => {
    const handleClick = jest.fn()
    const { getByRole } = render(
      <RadioOption {...block} onClick={handleClick} />
    )
    fireEvent.click(getByRole('button'))
    expect(handleClick).toBeCalledWith(block.id)
  })

  it('should call actionHandler on click', () => {
    const { getByRole } = render(<RadioOption {...block} />)
    fireEvent.click(getByRole('button'))
    expect(handleAction).toBeCalledWith(
      expect.objectContaining({
        push: expect.any(Function)
      }),
      {
        __typename: 'NavigateToBlockAction',
        gtmEventName: 'gtmEventName',
        blockId: 'def'
      }
    )
  })
})

describe('Admin RadioOption', () => {
  it('should edit option on click if parent is selectedBlock', () => {
    const { getByRole } = render(
      <EditorProvider
        initialState={{
          selectedBlock: {
            __typename: 'RadioQuestionBlock',
            id: 'RadioQuestion1',
            label: 'Label',
            description: 'Description',
            parentBlockId: 'RadioQuestion1',
            children: [block]
          }
        }}
      >
        <RadioOption {...block} />
      </EditorProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Option 1' }))

    expect(getByRole('button', { name: 'Option 1' })).toHaveStyle(
      'outline: 3px solid #C52D3A'
    )
    // Check editable when implemented
  })

  it('should edit option on click if sibling is selectedBlock', () => {
    const { getByRole } = render(
      <EditorProvider
        initialState={{
          selectedBlock: {
            ...block,
            id: 'RadioOption2',
            label: 'Option 2'
          }
        }}
      >
        <RadioOption {...block} />
      </EditorProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Option 1' }))

    expect(getByRole('button', { name: 'Option 1' })).toHaveStyle(
      'outline: 3px solid #C52D3A;'
    )
  })
})
