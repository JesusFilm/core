import { render } from '@testing-library/react'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { Editor } from '.'
import { ThemeProvider } from '..'
import { TreeBlock } from '@core/journeys/ui'

describe('Editor', () => {
  it('should render the element', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Editor
          journey={{
            __typename: 'Journey',
            id: 'journeyId',
            themeName: ThemeName.base,
            themeMode: ThemeMode.light,
            title: 'my journey',
            slug: 'my-journey',
            description: 'my cool journey',
            blocks: [
              {
                id: 'step0.id',
                __typename: 'StepBlock',
                parentBlockId: null,
                locked: false,
                nextBlockId: null,
                children: []
              }
            ] as TreeBlock[]
          }}
        />
      </ThemeProvider>
    )
    expect(getByText('Cards')).toBeInTheDocument()
    expect(getByText('Social Share Appearance')).toBeInTheDocument()
    expect(getByText('Social Image')).toBeInTheDocument()
  })
})
