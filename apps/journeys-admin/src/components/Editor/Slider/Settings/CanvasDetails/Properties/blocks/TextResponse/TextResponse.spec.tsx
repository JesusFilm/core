import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { TextResponse } from './TextResponse'

describe('TextResponse', () => {
  const defaultBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponseBlock.id',
    parentBlockId: null,
    parentOrder: null,
    label: 'default label',
    placeholder: null,
    hint: null,
    minRows: null,
    integrationId: null,
    type: null,
    routeId: null,
    required: null,
    children: []
  }

  const completeBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponseBlock.id',
    parentBlockId: null,
    parentOrder: null,
    label: 'complete label',
    placeholder: null,
    hint: 'hint text',
    minRows: 2,
    integrationId: null,
    type: null,
    routeId: null,
    required: null,
    children: [
      {
        id: 'icon.id',
        __typename: 'IconBlock',
        parentBlockId: 'button',
        parentOrder: 0,
        iconName: IconName.ArrowForwardRounded,
        iconColor: IconColor.action,
        iconSize: IconSize.lg,
        children: []
      }
    ]
  }

  it('should show default attributes', () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <TextResponse {...defaultBlock} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(
      getByRole('button', { name: 'Response Field default label' })
    ).toBeInTheDocument()
  })

  it('should have feedback edit accordion open', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <TextResponse {...completeBlock} />
            <TestEditorState />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      getByText('selectedAttributeId: textResponseBlock.id-text-field-options')
    ).toBeInTheDocument()
  })

  it('should show resolved customizable label value in accordion title', () => {
    const customizableBlock = {
      ...completeBlock,
      label: '{{ label }}'
    }

    const customizableJourney = {
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'label',
          value: 'Your customized label',
          defaultValue: 'Default label'
        }
      ]
    } as unknown as Journey

    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{ journey: customizableJourney, variant: 'admin' }}
          >
            <TextResponse {...customizableBlock} />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('Your customized label')).toBeInTheDocument()
  })

  it('should show unresolved customizable label value in accordion title', () => {
    const customizableBlock = {
      ...completeBlock,
      label: '{{ label }}'
    }

    const customizableJourney = {
      template: true,
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'label',
          value: 'Your customized label',
          defaultValue: 'Default label'
        }
      ]
    } as unknown as Journey

    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{ journey: customizableJourney, variant: 'admin' }}
          >
            <TextResponse {...customizableBlock} />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('{{ label }}')).toBeInTheDocument()
  })
})
