import { render } from '@testing-library/react'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { Editor } from '.'

describe('Editor', () => {
  it('should render the element', () => {
    const { getByText } = render(
      <Editor
        journey={{
          __typename: 'Journey',
          id: 'journeyId',
          themeName: ThemeName.base,
          themeMode: ThemeMode.light,
          title: 'my journey',
          slug: 'my-journey',
          description: 'my cool journey',
          blocks: []
        }}
      />
    )
    expect(getByText('Cards')).toBeInTheDocument()
  })
})
