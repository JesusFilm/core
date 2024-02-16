import {
  getByDisplayValue,
  getByLabelText,
  getByText,
  render
} from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'

import { StepBlockNode, StepBlockNodeData } from '.'
import { ReactFlowProvider } from 'reactflow'
import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import userEvent from '@testing-library/user-event'

describe('StepBlockNode', () => {
  const stepBlock: TreeBlock<StepBlock> = {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step3.id',
    children: []
  }

  const stepBlockNodeData: StepBlockNodeData = {
    steps: [],
    locked: false,
    nextBlockId: null,
    __typename: 'StepBlock',
    id: 'StepBlockId',
    parentBlockId: null,
    parentOrder: null,
    children: [
      {
        backgroundColor: null,
        children: [
          {
            alt: 'alt text for image',
            blurhash: 'UbLX6?~p9FtRkX.8ogD%IUj@M{adxaM_ofkW',
            children: [],
            height: 768,
            id: 'c1819b66-ecce-4448-aad5-1b0076e27a52',
            parentBlockId: 'f812a82e-50ad-464a-9d26-af07127ce742',
            parentOrder: 0,
            src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/ae95a856-1401-41e1-6f3e-7b4e6f707f00/public',
            width: 1152,
            __typename: 'ImageBlock'
          },
          {
            align: null,
            children: [],
            color: null,
            content: 'This title is really long',
            id: '2b59b819-667c-49c4-b2fe-ed1a1f355993',
            parentBlockId: 'f812a82e-50ad-464a-9d26-af07127ce742',
            parentOrder: 0,
            variant: null,
            __typename: 'TypographyBlock'
          },
          {
            align: null,
            children: [],
            color: null,
            content: 'This subtitle really long too',
            id: '2b59b819-667c-49c4-b2fe-ed1a1f355993',
            parentBlockId: 'f812a82e-50ad-464a-9d26-af07127ce742',
            parentOrder: 0,
            variant: null,
            __typename: 'TypographyBlock'
          }
        ],
        coverBlockId: 'c1819b66-ecce-4448-aad5-1b0076e27a52',
        fullscreen: false,
        id: 'f812a82e-50ad-464a-9d26-af07127ce742',
        parentBlockId: '94302faa-73b9-4023-b639-8b6e1ad5e391',
        parentOrder: 0,
        themeMode: null,
        themeName: null,
        __typename: 'CardBlock'
      }
    ]
  }

  it('should display the correct title and subtitle', () => {
    const { getByText } = render(
      <MockedProvider>
        <ReactFlowProvider>
          <Box>
            <StepBlockNode
              data={stepBlockNodeData}
              id={''}
              selected={false}
              type={''}
              zIndex={0}
              isConnectable={false}
              xPos={0}
              yPos={0}
              dragging={false}
            />
          </Box>
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(getByText('This title is really long')).toBeInTheDocument()
    expect(getByText('This subtitle really long too')).toBeInTheDocument()
  })
})
