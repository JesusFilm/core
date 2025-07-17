'use client'

import { MockedProvider } from '@apollo/client/testing'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, Formik } from 'formik'

import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { FormLanguageSelect } from './FormLanguageSelect'

describe('FormLanguageSelect', () => {
  it('should render and handle language selection', async () => {
    const handleSubmit = jest.fn()

    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <Formik initialValues={{ language: '' }} onSubmit={handleSubmit}>
          <Form>
            <FormLanguageSelect name="language" label="Language" />
            <button type="submit">Submit</button>
          </Form>
        </Formik>
      </MockedProvider>
    )

    const user = userEvent.setup()

    // Check initial state
    const languageSelect = screen.getByRole('combobox', { name: 'Language' })
    expect(languageSelect).toBeInTheDocument()
    expect(languageSelect).toHaveValue('')

    // Select a language
    await user.click(languageSelect)
    await act(async () => {
      await user.click(screen.getByRole('option', { name: 'English' }))
    })

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    // Verify form submission
    expect(handleSubmit).toHaveBeenCalledWith(
      { language: '529' },
      expect.anything()
    )
  })

  it('should render with initial language', async () => {
    const initialLanguage = {
      id: '529',
      localName: 'English',
      nativeName: 'English',
      slug: 'english'
    }

    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <Formik initialValues={{ language: '529' }} onSubmit={jest.fn()}>
          <Form>
            <FormLanguageSelect
              name="language"
              label="Language"
              initialLanguage={initialLanguage}
            />
          </Form>
        </Formik>
      </MockedProvider>
    )

    // Check that the initial language is selected
    const languageSelect = screen.getByRole('combobox', { name: 'Language' })
    expect(languageSelect).toHaveValue('English')
  })

  it('should filter out existing languages', async () => {
    // Create a mock of existing languages
    const existingLanguages = ['528'] // Spanish

    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <Formik initialValues={{ language: '' }} onSubmit={jest.fn()}>
          <Form>
            <FormLanguageSelect
              name="language"
              label="Language"
              existingLanguageIds={existingLanguages}
            />
          </Form>
        </Formik>
      </MockedProvider>
    )

    const user = userEvent.setup()

    // Open the dropdown
    const languageSelect = screen.getByRole('combobox', { name: 'Language' })
    await user.click(languageSelect)

    // Wait for the dropdown to load
    await act(async () => {
      // English should be in the dropdown
      expect(
        screen.getByRole('option', { name: 'English' })
      ).toBeInTheDocument()
      // Spanish should not be in the dropdown because it's in existingLanguages
      expect(
        screen.queryByRole('option', { name: 'Spanish' })
      ).not.toBeInTheDocument()
      // French should be in the dropdown
      expect(
        screen.getByRole('option', { name: 'French Français' })
      ).toBeInTheDocument()
    })
  })

  it('should include parent object language when filtering', async () => {
    // Create a mock of existing languages
    const existingLanguages = ['529', '528'] // English, Spanish

    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <Formik initialValues={{ language: '529' }} onSubmit={jest.fn()}>
          <Form>
            <FormLanguageSelect
              name="language"
              label="Language"
              existingLanguageIds={existingLanguages}
              parentObjectId="subtitle1"
              initialLanguage={{
                id: '529',
                localName: 'English',
                nativeName: 'English',
                slug: 'english'
              }}
            />
          </Form>
        </Formik>
      </MockedProvider>
    )

    const user = userEvent.setup()

    // Open the dropdown
    const languageSelect = screen.getByRole('combobox', { name: 'Language' })
    await user.click(languageSelect)

    // Wait for the dropdown to load
    await act(async () => {
      // English should be in the dropdown because it's the parent object's language
      expect(
        screen.getByRole('option', { name: 'English' })
      ).toBeInTheDocument()
      // Spanish should not be in the dropdown because it's in existingLanguages
      expect(
        screen.queryByRole('option', { name: 'Spanish' })
      ).not.toBeInTheDocument()
      // French should be in the dropdown
      expect(
        screen.getByRole('option', { name: 'French Français' })
      ).toBeInTheDocument()
    })
  })

  it('should show validation error', async () => {
    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <Formik
          initialValues={{ language: '' }}
          onSubmit={jest.fn()}
          validate={(values) => {
            const errors: { language?: string } = {}
            if (!values.language) {
              errors.language = 'Language is required'
            }
            return errors
          }}
        >
          <Form>
            <FormLanguageSelect name="language" label="Language" />
            <button type="submit">Submit</button>
          </Form>
        </Formik>
      </MockedProvider>
    )

    const user = userEvent.setup()

    // Submit the form without selecting a language
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    // Check that the error message is displayed
    await act(async () => {
      expect(screen.getByText('Language is required')).toBeInTheDocument()
    })
  })
})
