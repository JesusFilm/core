import { render, screen } from '@testing-library/react'
import { type NodeProps, ReactFlowProvider } from 'reactflow'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { ReferrerNode } from '.'

describe('ReferrerNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  it('should render default', () => {
    const nodeProps = {
      data: {
        property: 'Direct / None',
        visitors: 10
      }
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider>
          <ReferrerNode {...nodeProps} />
        </EditorProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('LinkAngledIcon')).toBeInTheDocument()
    expect(screen.getByText('Direct / None')).toBeInTheDocument()
    expect(screen.getByText(10)).toBeInTheDocument()
  })

  it('should render other sources', () => {
    const nodeProps = {
      data: {
        property: 'other sources',
        referrers: [
          {
            property: 'Facebook',
            visitors: 5
          },
          {
            property: 'Google',
            visitors: 5
          }
        ]
      }
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider>
          <ReferrerNode {...nodeProps} />
        </EditorProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('ChevronDownIcon')).toBeInTheDocument()
    expect(screen.getByText('other sources')).toBeInTheDocument()
    expect(screen.getByText(10)).toBeInTheDocument()
  })
})
