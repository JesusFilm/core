import { fireEvent, render, screen, within } from '@testing-library/react'
import { Formik, FormikProvider } from 'formik'

import { ContactActionType } from '../../../../../../../__generated__/globalTypes'
import { JourneyLink } from '../../../../utils/getJourneyLinks/getJourneyLinks'

import { LinksForm } from './LinksForm'

describe('LinksForm', () => {
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

  it('should update value on change and add https:// protocol automatically', () => {
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

    const setFieldValue = jest.fn()
    render(
      <Formik initialValues={{ 'url-1': '' }} onSubmit={jest.fn()}>
        {(formik) => (
          <FormikProvider value={{ ...formik, setFieldValue }}>
            <LinksForm links={links} />
          </FormikProvider>
        )}
      </Formik>
    )

    const input = within(screen.getByLabelText('Edit URL Link')).getByRole(
      'textbox'
    )
    fireEvent.blur(input, { target: { value: 'example.com' } })
    expect(setFieldValue).toHaveBeenCalledWith('url-1', 'https://example.com')
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

  it('should open email that already has mailto: protocol', () => {
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
        initialValues={{ 'email-1': 'mailto:test@example.com' }}
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

  it('should open chat buttons link with https:// protocol', () => {
    const links: JourneyLink[] = [
      {
        id: 'chat-1',
        linkType: 'chatButtons',
        url: '',
        label: 'Chat Link'
      }
    ]
    const openSpy = jest.spyOn(window, 'open').mockImplementation(jest.fn())

    render(
      <Formik initialValues={{ 'chat-1': 'wa.me/123' }} onSubmit={jest.fn()}>
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
      'https://wa.me/123',
      '_blank',
      'noopener,noreferrer'
    )
    openSpy.mockRestore()
  })

  it('should open phone link with tel: protocol', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(jest.fn())
    const links: JourneyLink[] = [
      {
        id: 'phone-1',
        linkType: 'phone',
        url: '+15551234',
        label: 'Call Us',
        parentStepId: 'step-1',
        customizable: true,
        contactAction: ContactActionType.call
      }
    ]
    render(
      <Formik
        initialValues={{ 'phone-1__cc': '+1', 'phone-1__local': '5551234' }}
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
      'tel:+15551234',
      '_blank',
      'noopener,noreferrer'
    )
    openSpy.mockRestore()
  })

  it('should open phone link with sms: protocol', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(jest.fn())
    const links: JourneyLink[] = [
      {
        id: 'phone-2',
        linkType: 'phone',
        url: '+15559876',
        label: 'Text Us',
        parentStepId: 'step-1',
        customizable: true,
        contactAction: ContactActionType.text
      }
    ]
    render(
      <Formik
        initialValues={{ 'phone-2__cc': '+1', 'phone-2__local': '5559876' }}
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
      'sms:+15559876',
      '_blank',
      'noopener,noreferrer'
    )
    openSpy.mockRestore()
  })

  it('calls formik setFieldValue when input changes', () => {
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

    const setFieldValue = jest.fn()
    render(
      <Formik initialValues={{ 'url-1': '' }} onSubmit={jest.fn()}>
        {(formik) => (
          <FormikProvider value={{ ...formik, setFieldValue }}>
            <LinksForm links={links} />
          </FormikProvider>
        )}
      </Formik>
    )

    const input = within(screen.getByLabelText('Edit URL Link')).getByRole(
      'textbox'
    )
    fireEvent.blur(input, { target: { value: 'example.com' } })
    expect(setFieldValue).toHaveBeenCalledWith('url-1', 'https://example.com')
  })

  it('should focus next input on enter keypress in phone field', () => {
    const links: JourneyLink[] = [
      {
        id: 'phone-1',
        linkType: 'phone',
        url: '+73333',
        label: 'Phone Link',
        parentStepId: null,
        customizable: null,
        contactAction: ContactActionType.call
      },
      {
        id: 'url-1',
        linkType: 'url',
        url: 'https://example.com',
        label: 'URL Link',
        parentStepId: null,
        customizable: null
      }
    ]

    render(
      <Formik
        initialValues={{
          'phone-1__cc': '+7',
          'phone-1__local': '3333',
          'url-1': ''
        }}
        onSubmit={jest.fn()}
      >
        {(formik) => (
          <FormikProvider value={formik}>
            <LinksForm links={links} />
          </FormikProvider>
        )}
      </Formik>
    )

    const countryInput = screen.getByLabelText('Country')

    countryInput.focus()
    expect(document.activeElement).toBe(countryInput)

    fireEvent.keyDown(countryInput, { key: 'Enter' })

    const phoneNumberInput = screen.getByLabelText('Phone Number')
    expect(document.activeElement).toBe(phoneNumberInput)
  })
})
