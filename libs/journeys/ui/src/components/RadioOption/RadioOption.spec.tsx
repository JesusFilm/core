import { fireEvent, render, screen } from '@testing-library/react'

import { handleAction } from '../../libs/action'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import type { TreeBlock } from '../../libs/block'

import { RadioOptionFields } from './__generated__/RadioOptionFields'

import { RadioOption } from '.'

jest.mock('../../libs/action', () => {
  const originalModule = jest.requireActual('../../libs/action')
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
  id: 'radioOption1.id',
  label: 'Option 1',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 0,
  action: {
    __typename: 'NavigateToBlockAction',
    parentBlockId: 'radioOption1.id',
    gtmEventName: 'gtmEventName',
    blockId: 'def'
  },
  pollOptionImageBlockId: null,
  children: []
}

describe('RadioOption', () => {
  describe('list variant', () => {
    it('should handle onClick', () => {
      const handleClick = jest.fn()

      render(<RadioOption {...block} onClick={handleClick} />)

      fireEvent.click(screen.getByTestId('JourneysRadioOptionList'))
      expect(handleClick).toHaveBeenCalledWith(block.id, block.label)
    })

    it('should call actionHandler on click', () => {
      render(<RadioOption {...block} />)

      fireEvent.click(screen.getByTestId('JourneysRadioOptionList'))
      expect(handleAction).toHaveBeenCalledWith(
        expect.objectContaining({
          push: expect.any(Function)
        }),
        {
          __typename: 'NavigateToBlockAction',
          parentBlockId: 'radioOption1.id',
          gtmEventName: 'gtmEventName',
          blockId: 'def'
        },
        undefined
      )
    })

    it('resolves label from journey customization fields', () => {
      const journey = {
        journeyCustomizationFields: [
          {
            __typename: 'JourneyCustomizationField',
            id: '1',
            journeyId: 'journeyId',
            key: 'name',
            value: 'Alice',
            defaultValue: 'Anonymous'
          }
        ]
      } as unknown as Journey

      const withTemplate = { ...block, label: '{{ name }}' }

      render(
        <JourneyProvider value={{ journey, variant: 'default' }}>
          <RadioOption {...withTemplate} />
        </JourneyProvider>
      )

      expect(screen.getByRole('button')).toHaveTextContent('Alice')
    })

    it('does not resolve label in admin variant', () => {
      const journey = {
        journeyCustomizationFields: [
          {
            __typename: 'JourneyCustomizationField',
            id: '1',
            journeyId: 'journeyId',
            key: 'name',
            value: 'Alice',
            defaultValue: 'Anonymous'
          }
        ]
      } as unknown as Journey

      const withTemplate = { ...block, label: '{{ name }}' }

      render(
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <RadioOption {...withTemplate} />
        </JourneyProvider>
      )

      expect(screen.getByRole('button')).toHaveTextContent('{{ name }}')
    })
  })

  describe('grid variant', () => {
    it('should handle onClick', () => {
      const handleClick = jest.fn()

      render(<RadioOption {...block} onClick={handleClick} gridView />)

      fireEvent.click(screen.getByTestId('JourneysRadioOptionGrid'))
      expect(handleClick).toHaveBeenCalledWith(block.id, block.label)
    })

    it('should call actionHandler on click', () => {
      render(<RadioOption {...block} gridView />)

      fireEvent.click(screen.getByTestId('JourneysRadioOptionGrid'))
      expect(handleAction).toHaveBeenCalledWith(
        expect.objectContaining({
          push: expect.any(Function)
        }),
        {
          __typename: 'NavigateToBlockAction',
          parentBlockId: 'radioOption1.id',
          gtmEventName: 'gtmEventName',
          blockId: 'def'
        },
        undefined
      )
    })

    it('resolves label from journey customization fields in grid view', () => {
      const journey = {
        journeyCustomizationFields: [
          {
            __typename: 'JourneyCustomizationField',
            id: '1',
            journeyId: 'journeyId',
            key: 'name',
            value: 'Alice',
            defaultValue: 'Anonymous'
          }
        ]
      } as unknown as Journey

      const withTemplate = { ...block, label: '{{ name }}' }

      render(
        <JourneyProvider value={{ journey, variant: 'default' }}>
          <RadioOption {...withTemplate} gridView />
        </JourneyProvider>
      )

      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })
})
