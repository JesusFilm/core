import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { ThemeProvider } from '../../../../../ThemeProvider'

import { AddBlock } from '.'

describe('AddNewBlock', () => {

  it('renders add blocks toolbar properly', () => {
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
})
