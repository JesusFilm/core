import { fireEvent, render, screen } from '@testing-library/react'

import { FontFamily, ThemeSettings } from './ThemeSettings'

describe('ThemeSettings', () => {
  const onHeaderFontChange = jest.fn()
  const onBodyFontChange = jest.fn()
  const onLabelsFontChange = jest.fn()

  it('should render theme settings', async () => {
    render(
      <ThemeSettings
        onHeaderFontChange={onHeaderFontChange}
        onBodyFontChange={onBodyFontChange}
        onLabelsFontChange={onLabelsFontChange}
        headerFont={FontFamily.Montserrat}
        bodyFont={FontFamily.Montserrat}
        labelsFont={FontFamily.Montserrat}
      />
    )

    expect(
      screen.getByRole('combobox', { name: 'Header Text' })
    ).toHaveTextContent(FontFamily.Montserrat)
    expect(
      screen.getByRole('combobox', { name: 'Body Text' })
    ).toHaveTextContent(FontFamily.Montserrat)
    expect(
      screen.getByRole('combobox', { name: 'Label Text' })
    ).toHaveTextContent(FontFamily.Montserrat)
  })

  it('should call onHeaderFontChange when header font is changed', () => {
    render(
      <ThemeSettings
        onHeaderFontChange={onHeaderFontChange}
        onBodyFontChange={onBodyFontChange}
        onLabelsFontChange={onLabelsFontChange}
        headerFont={FontFamily.Montserrat}
        bodyFont={FontFamily.Montserrat}
        labelsFont={FontFamily.Montserrat}
      />
    )

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Header Text' }))
    fireEvent.click(screen.getByRole('option', { name: FontFamily.Inter }))
    expect(onHeaderFontChange).toHaveBeenCalledWith(FontFamily.Inter)
  })

  it('should call onBodyFontChange when body font is changed', () => {
    render(
      <ThemeSettings
        onHeaderFontChange={onHeaderFontChange}
        onBodyFontChange={onBodyFontChange}
        onLabelsFontChange={onLabelsFontChange}
        headerFont={FontFamily.Montserrat}
        bodyFont={FontFamily.Montserrat}
        labelsFont={FontFamily.Montserrat}
      />
    )

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Body Text' }))
    fireEvent.click(screen.getByRole('option', { name: FontFamily.Inter }))
    expect(onBodyFontChange).toHaveBeenCalledWith(FontFamily.Inter)
  })

  it('should call onLabelsFontChange when labels font is changed', () => {
    render(
      <ThemeSettings
        onHeaderFontChange={onHeaderFontChange}
        onBodyFontChange={onBodyFontChange}
        onLabelsFontChange={onLabelsFontChange}
        headerFont={FontFamily.Montserrat}
        bodyFont={FontFamily.Montserrat}
        labelsFont={FontFamily.Montserrat}
      />
    )

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Label Text' }))
    fireEvent.click(screen.getByRole('option', { name: FontFamily.Inter }))
    expect(onLabelsFontChange).toHaveBeenCalledWith(FontFamily.Inter)
  })
})
