import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  CardFormCreate,
  CardFormCreateVariables
} from '../../../../../../__generated__/CardFormCreate'
import {
  IconName,
  TypographyColor,
  TypographyVariant
} from '../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../__generated__/JourneyFields'

import { CARD_FORM_CREATE } from './CardForm'

import { CardForm } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('CardForm', () => {
  it('updates card content and updates local cache', async () => {
    mockUuidv4.mockReturnValueOnce('textResponseId')
    mockUuidv4.mockReturnValueOnce('submitIconId')
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'StepBlock:stepId' }, { __ref: 'CardBlock:cardId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const card: TreeBlock = {
      id: 'cardId',
      __typename: 'CardBlock',
      parentBlockId: 'stepId',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const step: TreeBlock = {
      id: 'stepId',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: [card]
    }
    const cardFormCreateMock: MockedResponse<
      CardFormCreate,
      CardFormCreateVariables
    > = {
      request: {
        query: CARD_FORM_CREATE,
        variables: {
          imageInput: {
            journeyId: 'journeyId',
            parentBlockId: 'cardId',
            alt: 'photo-1488048924544-c818a467dacd',
            blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
            height: 3456,
            src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
            width: 5184,
            isCover: true
          },
          subtitleInput: {
            journeyId: 'journeyId',
            parentBlockId: 'cardId',
            content: 'Prayer Request',
            variant: TypographyVariant.h6
          },
          titleInput: {
            journeyId: 'journeyId',
            parentBlockId: 'cardId',
            content: 'How can we pray for you?',
            variant: TypographyVariant.h1
          },
          textResponseInput: {
            id: 'textResponseId',
            journeyId: 'journeyId',
            parentBlockId: 'cardId',
            label: 'Your answer here',
            submitLabel: 'Submit'
          },
          submitIconInput: {
            id: 'submitIconId',
            journeyId: 'journeyId',
            parentBlockId: 'textResponseId',
            name: IconName.ArrowForwardRounded
          },
          textResponseId: 'textResponseId',
          textResponseUpdateInput: {
            submitIconId: 'submitIconId'
          },
          bodyInput: {
            journeyId: 'journeyId',
            parentBlockId: 'cardId',
            content:
              "Each day, we pray for those in our city. We'd be grateful to include your personal needs.",
            variant: TypographyVariant.caption,
            color: TypographyColor.secondary
          },
          journeyId: 'journeyId',
          cardId: 'cardId',
          cardInput: {
            fullscreen: true
          }
        }
      },
      result: {
        data: {
          image: {
            id: 'imageId',
            parentBlockId: 'cardId',
            parentOrder: null,
            src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
            alt: 'photo-1488048924544-c818a467dacd',
            width: 5184,
            height: 3456,
            blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
            __typename: 'ImageBlock'
          },
          subtitle: {
            id: 'subtitleId',
            parentBlockId: 'cardId',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'Prayer Request',
            variant: TypographyVariant.h6,
            __typename: 'TypographyBlock'
          },
          title: {
            id: 'titleId',
            parentBlockId: 'cardId',
            parentOrder: 1,
            align: null,
            color: null,
            content: 'How can we pray for you?',
            variant: TypographyVariant.h1,
            __typename: 'TypographyBlock'
          },
          textResponse: {
            id: 'textResponseId',
            parentBlockId: 'cardId',
            parentOrder: 2,
            label: 'Your answer here',
            hint: null,
            minRows: null,
            submitLabel: 'Submit',
            submitIconId: null,
            action: null,
            __typename: 'TextResponseBlock'
          },
          submitIcon: {
            id: 'submitIconId',
            parentBlockId: 'textResponseId',
            parentOrder: null,
            iconName: IconName.ArrowForwardRounded,
            iconSize: null,
            iconColor: null,
            __typename: 'IconBlock'
          },
          textResponseBlockUpdate: {
            id: 'textResponseId',
            parentBlockId: 'cardId',
            parentOrder: 2,
            label: 'Your answer here',
            hint: null,
            minRows: null,
            submitLabel: 'Submit',
            submitIconId: 'submitIconId',
            action: null,
            __typename: 'TextResponseBlock'
          },
          body: {
            id: 'bodyId',
            parentBlockId: 'cardId',
            parentOrder: 3,
            align: null,
            color: TypographyColor.secondary,
            content:
              "Each day, we pray for those in our city. We'd be grateful to include your personal needs.",
            variant: TypographyVariant.caption,
            __typename: 'TypographyBlock'
          },
          cardBlockUpdate: {
            id: 'cardId',
            parentBlockId: 'stepId',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: 'imageId',
            themeMode: null,
            themeName: null,
            fullscreen: true,
            __typename: 'CardBlock'
          }
        }
      }
    }
    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardFormCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardForm onClick={jest.fn()} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Form Template' }))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' },
        { __ref: 'ImageBlock:imageId' },
        { __ref: 'TypographyBlock:subtitleId' },
        { __ref: 'TypographyBlock:titleId' },
        { __ref: 'TextResponseBlock:textResponseId' },
        { __ref: 'IconBlock:submitIconId' },
        { __ref: 'TypographyBlock:bodyId' }
      ])
    })
  })
})
