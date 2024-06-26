import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { render, screen } from '@testing-library/react'
import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { TextResponseType } from '../../../../../../../../../../../__generated__/globalTypes'
import { GrowthSpacesIntegrations } from '../GrowthSpacesIntegrations'

describe('GrowthSpacesIntegrations', () => {
  const selectedBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse0.id',
    parentBlockId: '0',
    parentOrder: 0,
    label: 'Your answer here',
    hint: null,
    minRows: null,
    integrationId: null,
    routeId: null,
    type: TextResponseType.email,
    children: []
  }
  it('should render Growth Spaces Integrations if type is email', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <GrowthSpacesIntegrations />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Growth Spaces Integrations')).toBeInTheDocument()
  })

  it('should render Routes if integrationId is set', () => {
    const selectedBlockWithIntegrationId: TreeBlock<TextResponseBlock> = {
      ...selectedBlock,
      integrationId: 'integration.id'
    }
    render(
      <MockedProvider>
        <EditorProvider
          initialState={{ selectedBlock: selectedBlockWithIntegrationId }}
        >
          <GrowthSpacesIntegrations />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Growth Spaces Integrations')).toBeInTheDocument()
    expect(screen.getByText('Route')).toBeInTheDocument()
  })
})
