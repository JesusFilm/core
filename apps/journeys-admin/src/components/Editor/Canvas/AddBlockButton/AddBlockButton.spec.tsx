import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { AddBlockButton } from '.'

describe('AddBlockButton', () => {
  it('contains all blocks', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <FlagsProvider flags={{ formiumForm: true }}>
          <AddBlockButton />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByTestId('AddIcon')).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewTypographyButton')
    ).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewImageButton')).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewVideoButton')).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewRadioQuestionButton')
    ).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewTextResponseButton')
    ).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewSignUpButton')
    ).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewButton')).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewFormiumFormIcon')
    ).toBeInTheDocument()
  })
})
