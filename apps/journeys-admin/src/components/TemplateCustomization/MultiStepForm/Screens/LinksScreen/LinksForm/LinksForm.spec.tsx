/* eslint-disable jest/valid-title */
/* eslint-disable jest/valid-title */
/* eslint-disable jest/valid-title */
import { render, screen, fireEvent, within } from '@testing-library/react'
import { Formik, FormikProvider } from 'formik'
import React from 'react'

import { LinksForm } from './LinksForm'
import { JourneyLink } from '../../../../utils/getJourneyLinks/getJourneyLinks'

describe('LinksForm', () => {
  // eslint-disable-next-line jest/valid-title
  it('should render links with labels, fields and open buttons', () => {
    const links: JourneyLink[] = [
      {
        id: 'url-1',
        linkType: 'url',
        url: 'https://example.com',
        label: 'URL Link',
        parentStepId: null,
        customizable: null
      },
      {
        id: 'email-1',
        linkType: 'email',
        url: 'test@example.com',
        label: 'Email Link',
        parentStepId: null,
        customizable: null
      },
      {
        id: 'chat-1',
        linkType: 'chatButtons',
        url: 'wa.me/123',
        label: 'Chat Link'
      }
    ]

    render(
      <Formik
        initialValues={{ 'url-1': '', 'email-1': '', 'chat-1': '' }}
        onSubmit={jest.fn()}
      >
        {(formik) => (
          <FormikProvider value={formik}>
            <LinksForm links={links} />
          </FormikProvider>
        )}
      </Formik>
    )

    expect(screen.getByText('URL Link')).toBeInTheDocument()
    expect(screen.getByText('Email Link')).toBeInTheDocument()
    expect(screen.getByText('Chat Link')).toBeInTheDocument()

    const openButtons = screen.getAllByRole('button', {
      name: 'Open link in new tab'
    })
    expect(openButtons).toHaveLength(3)
    const urlGroup = screen.getByLabelText('Edit URL Link')
    const emailGroup = screen.getByLabelText('Edit Email Link')
    const chatGroup = screen.getByLabelText('Edit Chat Link')
    expect(within(urlGroup).getByRole('textbox')).toBeInTheDocument()
    expect(within(emailGroup).getByRole('textbox')).toBeInTheDocument()
    expect(within(chatGroup).getByRole('textbox')).toBeInTheDocument()
  })

  // eslint-disable-next-line jest/valid-title
  it('should update value on change', () => {
    const links: JourneyLink[] = [
      {
        id: 'url-1',
        linkType: 'url',
        url: '',
        label: 'URL Link',
        parentStepId: null,
        customizable: null
      }
    ]

    render(
      <Formik initialValues={{ 'url-1': '' }} onSubmit={jest.fn()}>
        {(formik) => (
          <FormikProvider value={formik}>
            <LinksForm links={links} />
          </FormikProvider>
        )}
      </Formik>
    )

    const input = within(screen.getByLabelText('Edit URL Link')).getByRole(
      'textbox'
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'example.com' } })
    expect(input.value).toBe('example.com')
  })

  it('should open normalized http(s) link', () => {
    const links: JourneyLink[] = [
      {
        id: 'url-1',
        linkType: 'url',
        url: '',
        label: 'URL Link',
        parentStepId: null,
        customizable: null
      }
    ]
    const openSpy = jest.spyOn(window, 'open').mockImplementation(jest.fn())

    render(
      <Formik initialValues={{ 'url-1': 'example.com' }} onSubmit={jest.fn()}>
        {(formik) => (
          <FormikProvider value={formik}>
            <LinksForm links={links} />
          </FormikProvider>
        )}
      </Formik>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Open link in new tab' })
    )
    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer'
    )
    openSpy.mockRestore()
  })

  it('should open email via mailto:', () => {
    const links: JourneyLink[] = [
      {
        id: 'email-1',
        linkType: 'email',
        url: '',
        label: 'Email Link',
        parentStepId: null,
        customizable: null
      }
    ]
    const openSpy = jest.spyOn(window, 'open').mockImplementation(jest.fn())

    render(
      <Formik
        initialValues={{ 'email-1': 'test@example.com' }}
        onSubmit={jest.fn()}
      >
        {(formik) => (
          <FormikProvider value={formik}>
            <LinksForm links={links} />
          </FormikProvider>
        )}
      </Formik>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Open link in new tab' })
    )
    expect(openSpy).toHaveBeenCalledWith(
      'mailto:test@example.com',
      '_blank',
      'noopener,noreferrer'
    )
    openSpy.mockRestore()
  })

  // eslint-disable-next-line jest/valid-title
  it('calls formik handleChange when input changes', () => {
    const links: JourneyLink[] = [
      {
        id: 'url-1',
        linkType: 'url',
        url: '',
        label: 'URL Link',
        parentStepId: null,
        customizable: null
      }
    ]

    const handleChange = jest.fn()
    render(
      <Formik initialValues={{ 'url-1': '' }} onSubmit={jest.fn()}>
        {(formik) => (
          <FormikProvider value={{ ...formik, handleChange }}>
            <LinksForm links={links} />
          </FormikProvider>
        )}
      </Formik>
    )

    const input = within(screen.getByLabelText('Edit URL Link')).getByRole(
      'textbox'
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'example.com' } })
    expect(handleChange).toHaveBeenCalled()
  })
})
