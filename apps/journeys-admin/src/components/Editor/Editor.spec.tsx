import { render, fireEvent } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { ThemeProvider } from '../ThemeProvider'
import { Editor } from '.'

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

  it('should not show the add button when on Blocks tab', () => {
    const { getByRole } = render(
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

    const blocksTab = getByRole('tab', { name: 'Blocks' })
    const addButton = getByRole('button', { name: 'ADD' })
    expect(blocksTab).toBeInTheDocument()
    expect(addButton).toBeInTheDocument()
    fireEvent.click(blocksTab)
    expect(addButton).not.toBeInTheDocument()
  })
})
