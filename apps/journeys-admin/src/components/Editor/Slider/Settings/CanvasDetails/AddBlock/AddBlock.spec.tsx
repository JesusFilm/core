import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../ThemeProvider'

import { AddBlock } from '.'

describe('AddNewBlock', () => {
  const selectedStep: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: 'journeyId',
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'typography0.id',
            __typename: 'TypographyBlock',
            parentBlockId: 'card1.id',
            parentOrder: 0,
            content: 'Title',
            variant: TypographyVariant.h1,
            color: TypographyColor.primary,
            align: TypographyAlign.center,
            children: []
          }
        ]
      }
    ]
  }

  it('renders add blocks toolbar properly', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <FlagsProvider flags={{ formiumForm: true }}>
            <AddBlock />
          </FlagsProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(
      getByTestId('JourneysAdminButtonNewTypographyButton')
    ).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewImageButton')).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewVideoButton')).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewRadioQuestionButton')
    ).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewRadioQuestionButton')
    ).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewSignUpButton')
    ).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewButton')).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewFormiumFormIcon')
    ).toBeInTheDocument()
  })

  it('does not render FormiumForm button when flag is false', () => {
    const { queryByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <FlagsProvider flags={{ formiumForm: false }}>
            <AddBlock />
          </FlagsProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      queryByTestId('JourneysAdminButtonNewFormiumFormIcon')
    ).not.toBeInTheDocument()
  })

  it('should disable NewVideoButton when there are other blocks on the Card', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider initialState={{ selectedStep }}>
            <AddBlock />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    const newVideoButtonDiv = getByTestId('JourneysAdminButtonNewVideoButton')
    const newVideoButton = newVideoButtonDiv.querySelector('button')

    expect(newVideoButton).toBeDisabled()
  })
})
