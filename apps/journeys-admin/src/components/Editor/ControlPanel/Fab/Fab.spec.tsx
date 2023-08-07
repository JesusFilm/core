import { fireEvent, render } from '@testing-library/react'

import { ActiveFab, EditorProvider } from '@core/journeys/ui/EditorProvider'

import { Fab } from '.'

describe('Fab', () => {
  const onClick = jest.fn()

  describe('Add Fab', () => {
    it('should render the add fab', () => {
      const { getByRole } = render(
        <EditorProvider initialState={{ activeFab: ActiveFab.Add }}>
          <Fab visible onAddClick={onClick} />
        </EditorProvider>
      )

      expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
    })

    it('should render the add fab by default', () => {
      const { getByRole } = render(<Fab visible onAddClick={onClick} />)

      expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
    })

    it('should call onClick when add fab clicked', () => {
      const { getByRole } = render(<Fab visible onAddClick={onClick} />)

      const button = getByRole('button', { name: 'Add' })
      fireEvent.click(button)
      expect(onClick).toHaveBeenCalled()
    })
  })

  describe('Edit Fab', () => {
    it('should render the edit fab', () => {
      const { getByRole } = render(
        <EditorProvider initialState={{ activeFab: ActiveFab.Edit }}>
          <Fab visible onAddClick={onClick} />
        </EditorProvider>
      )

      expect(getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })

    it('should switch to save fab on edit fab click', () => {
      const { getByRole } = render(
        <EditorProvider initialState={{ activeFab: ActiveFab.Edit }}>
          <Fab visible onAddClick={onClick} />
        </EditorProvider>
      )

      const button = getByRole('button', { name: 'Edit' })
      fireEvent.click(button)
      expect(button).toHaveTextContent('Done')
    })
  })

  describe('Save Fab', () => {
    it('should render the Save fab', () => {
      const { getByRole } = render(
        <EditorProvider initialState={{ activeFab: ActiveFab.Save }}>
          <Fab visible onAddClick={onClick} />
        </EditorProvider>
      )
      expect(getByRole('button', { name: 'Done' })).toBeInTheDocument()
    })

    it('should switch back to edit fab after saving', () => {
      const { getByRole } = render(
        <EditorProvider initialState={{ activeFab: ActiveFab.Save }}>
          <Fab visible onAddClick={onClick} />
        </EditorProvider>
      )

      const button = getByRole('button', { name: 'Done' })
      fireEvent.click(button)
      expect(button).toHaveTextContent('Edit')
    })
  })

  it('should not show fab if visible is false', () => {
    const { queryByRole } = render(<Fab onAddClick={onClick} />)
    expect(queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
  })
})
