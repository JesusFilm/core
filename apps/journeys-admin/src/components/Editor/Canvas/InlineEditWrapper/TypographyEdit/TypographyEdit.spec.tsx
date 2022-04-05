import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { TypographyVariant } from '../../../../../../__generated__/globalTypes'
import { TypographyFields } from '../../../../../../__generated__/TypographyFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../libs/context'
import { TypographyEdit, TYPOGRAPHY_BLOCK_UPDATE_CONTENT } from '.'

describe('TypographyEdit', () => {
  const props: TreeBlock<TypographyFields> = {
    __typename: 'TypographyBlock',
    parentBlockId: 'card.id',
    parentOrder: 0,
    id: 'typography.id',
    variant: TypographyVariant.body1,
    content: 'test content',
    align: null,
    color: null,
    children: []
  }
  it('selects the input on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <TypographyEdit {...props} />
      </MockedProvider>
    )
    const input = getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
  })

  it('saves the text content on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'updated content'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'typography.id',
                journeyId: 'journeyId',
                input: {
                  content: 'updated content'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider>
            <TypographyEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated content    ' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
