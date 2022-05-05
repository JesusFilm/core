import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock } from '../..'
import { StepFields } from './__generated__/StepFields'
import { STEP_VIEW_EVENT_CREATE } from './Step'
import { Step } from '.'

const block: TreeBlock<StepFields> = {
  __typename: 'StepBlock',
  id: 'Step1',
  parentBlockId: null,
  parentOrder: 0,
  nextBlockId: null,
  locked: false,
  children: [
    {
      __typename: 'ButtonBlock',
      id: 'Button1',
      parentBlockId: 'Step1',
      parentOrder: 0,
      label: 'Button 1',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    },
    {
      __typename: 'ButtonBlock',
      id: 'Button2',
      parentBlockId: 'Step1',
      parentOrder: 1,
      label: 'Button 2',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }
  ]
}

describe('Step', () => {
  it('should create a stepViewEvent', async () => {
    const result = jest.fn(() => ({
      data: {
        stepViewEventCreate: {
          id: 'uuid',
          __typename: 'StepViewEvent'
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: STEP_VIEW_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'Step1'
                }
              }
            },
            result
          }
        ]}
      >
        <Step {...block} uuid={() => 'uuid'} />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should render blocks', () => {
    const { getByText } = render(
      <MockedProvider>
        <Step {...block} />
      </MockedProvider>
    )
    expect(getByText('Button 1')).toBeInTheDocument()
    expect(getByText('Button 2')).toBeInTheDocument()
  })

  it('should render empty block', () => {
    const { baseElement } = render(
      <MockedProvider>
        {/* eslint-disable-next-line react/no-children-prop */}
        <Step {...block} children={[]} />
      </MockedProvider>
    )
    expect(baseElement).toContainHTML('<body><div /></body>')
  })
})
