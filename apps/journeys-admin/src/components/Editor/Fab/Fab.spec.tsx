import { render } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import {
  ActiveFab,
  ActiveSlide
} from '@core/journeys/ui/EditorProvider/EditorProvider'

import { Fab } from './Fab'

describe('Fab', () => {
  it('switches through all fab states', () => {
    const { getByTestId } = render(
      <EditorProvider
        initialState={{
          activeSlide: ActiveSlide.Content,
          activeFab: ActiveFab.Add
        }}
      >
        <Fab />
      </EditorProvider>
    )
    expect(getByTestId('Fab')).toHaveTextContent('Add')
  })
})
