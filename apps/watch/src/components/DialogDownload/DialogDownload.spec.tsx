import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useDownloader from 'react-use-downloader'

import {
  VideoContentFields_variant as Variant,
  VideoContentFields
} from '../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { DialogDownload } from './DialogDownload'

jest.mock('react-use-downloader', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('@core/shared/uimodern/components/select', () => {
  const React = require('react')

  const extractText = (children: React.ReactNode): string => {
    if (typeof children === 'string' || typeof children === 'number') return `${children}`
    if (Array.isArray(children)) return children.map((child) => extractText(child)).join('')
    if (React.isValidElement(children)) return extractText(children.props.children)
    return ''
  }

  const SelectContext = React.createContext({
    value: '',
    onValueChange: (value: string) => value,
    options: [] as Array<{ value: string; label: string }>,
    registerOption: (_option: { value: string; label: string }) => {},
    placeholder: undefined as string | undefined,
    setPlaceholder: (_placeholder?: string) => {}
  })

  const Select = ({ value, onValueChange, children }: any) => {
    const [options, setOptions] = React.useState<Array<{ value: string; label: string }>>([])
    const [placeholder, setPlaceholder] = React.useState<string | undefined>()

    const registerOption = React.useCallback((option: { value: string; label: string }) => {
      setOptions((prev) => {
        const existingOptions = prev.filter((item) => item.value !== option.value)
        return [...existingOptions, option]
      })
    }, [])

    return (
      <SelectContext.Provider
        value={{ value, onValueChange, options, registerOption, placeholder, setPlaceholder }}
      >
        {children}
      </SelectContext.Provider>
    )
  }

  const SelectTrigger = ({ 'aria-label': ariaLabel, id }: any) => {
    const { value, onValueChange, options, placeholder } = React.useContext(SelectContext)

    return (
      <select
        aria-label={ariaLabel}
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      >
        {placeholder ? (
          <option value="" disabled={value !== ''} hidden={value !== ''}>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  const SelectContent = ({ children }: any) => <>{children}</>

  const SelectItem = ({ value, children }: any) => {
    const { registerOption } = React.useContext(SelectContext)

    React.useEffect(() => {
      registerOption({ value, label: extractText(children) })
    }, [value, children, registerOption])

    return null
  }

  const SelectValue = ({ placeholder }: any) => {
    const { setPlaceholder } = React.useContext(SelectContext)

    React.useEffect(() => {
      setPlaceholder(placeholder)
    }, [placeholder, setPlaceholder])

    return null
  }

  return {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
  }
})

class ResizeObserverMock {
  // eslint-disable-next-line class-methods-use-this
  observe(): void {}
  // eslint-disable-next-line class-methods-use-this
  unobserve(): void {}
  // eslint-disable-next-line class-methods-use-this
  disconnect(): void {}
}

beforeAll(() => {
  // @ts-expect-error - test environment polyfill
  global.ResizeObserver = ResizeObserverMock
  // @ts-expect-error - jsdom pointer capture polyfill
  Element.prototype.hasPointerCapture = () => false
  // @ts-expect-error - jsdom pointer capture polyfill
  Element.prototype.setPointerCapture = () => {}
  // @ts-expect-error - jsdom pointer capture polyfill
  Element.prototype.releasePointerCapture = () => {}
})

describe('DialogDownload', () => {
  const onClose = jest.fn()
  const onDownload = jest.fn()
  const onCancel = jest.fn()
  const video: VideoContentFields = videos[0]

  beforeEach(() => {
    jest.clearAllMocks()
    const useDownloaderMock = useDownloader as jest.MockedFunction<
      typeof useDownloader
    >
    useDownloaderMock.mockReturnValue({
      percentage: 75,
      download: onDownload,
      cancel: onCancel,
      isInProgress: false,
      size: 100,
      elapsed: 0,
      error: null
    })
  })

  it('closes the modal and cancels download on cancel icon click', () => {
    const { getByTestId } = render(
      <VideoProvider value={{ content: video }}>
        <DialogDownload open onClose={onClose} />
      </VideoProvider>
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
  })

  it('downloads the selected video when terms are accepted', async () => {
    const { getByRole } = render(
      <VideoProvider value={{ content: video }}>
        <DialogDownload open onClose={onClose} />
      </VideoProvider>
    )

    const downloadButton = getByRole('button', { name: 'Download' })

    expect(downloadButton).toBeDisabled()

    await userEvent.click(getByRole('checkbox'))

    expect(downloadButton).not.toBeDisabled()

    await userEvent.click(getByRole('button', { name: 'Download' }))

    await waitFor(() => {
      expect(onDownload).toHaveBeenCalledWith(
        video.variant?.downloads[0].url,
        `${video.title[0].value}.mp4`
      )
    })
  })

  it('downloads alternate quality videos', async () => {
    render(
      <VideoProvider value={{ content: video }}>
        <DialogDownload open onClose={onClose} />
      </VideoProvider>
    )

    const downloadButton = screen.getByRole('button', { name: 'Download' })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      video.variant?.downloads?.[1]?.url ?? ''
    )

    await userEvent.click(screen.getByRole('checkbox'))

    expect(downloadButton).not.toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Download' }))

    await waitFor(() => {
      expect(onDownload).toHaveBeenCalledWith(
        video.variant?.downloads[1].url,
        `${video.title[0].value}.mp4`
      )
    })
  })

  it('should display error message when no downloads', async () => {
    const noDownloadsVideo = {
      ...video,
      variant: {
        ...video.variant,
        downloads: []
      } as unknown as Variant
    }
    render(
      <VideoProvider value={{ content: noDownloadsVideo }}>
        <DialogDownload open onClose={onClose} />
      </VideoProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('No Downloads Available')).toBeInTheDocument()
    )
  })

  it('changes checkbox when submit or close', async () => {
    const { getByText, getByRole, queryByText } = render(
      <VideoProvider value={{ content: video }}>
        <DialogDownload open onClose={onClose} />
      </VideoProvider>
    )
    const agreementCheckbox = getByRole('checkbox', { name: /I agree to the/i })
    fireEvent.click(getByText('Terms of Use'))
    fireEvent.click(getByText('Accept'))
    await waitFor(() => expect(queryByText('Accept')).not.toBeInTheDocument())
    expect(agreementCheckbox).toBeChecked()
    fireEvent.click(getByText('Terms of Use'))
    fireEvent.click(getByText('Cancel'))
    await waitFor(() => expect(queryByText('Cancel')).not.toBeInTheDocument())
    expect(agreementCheckbox).not.toBeChecked()
  })

  it('should render Mux stream URLs as direct links instead of form submissions', () => {
    const muxVideo = {
      ...video,
      variant: {
        ...video.variant,
        downloads: [
          {
            ...video.variant?.downloads[0],
            url: 'https://stream.mux.com/test-url'
          }
        ]
      }
    } as VideoContentFields

    render(
      <VideoProvider value={{ content: muxVideo }}>
        <DialogDownload open onClose={onClose} />
      </VideoProvider>
    )

    const termsCheckbox = screen.getByRole('checkbox')
    fireEvent.click(termsCheckbox)

    // For Mux streams, should show download button with href attribute (direct link)
    const downloadButton = screen.getByRole('link', { name: 'Download' })
    expect(downloadButton).toHaveAttribute('href')
    expect(downloadButton).not.toHaveAttribute('type', 'submit')
  })

  it('should render regular URLs as form submissions', () => {
    const regularVideo = {
      ...video,
      variant: {
        ...video.variant,
        downloads: [
          {
            ...video.variant?.downloads[0],
            url: 'https://example.com/video.mp4'
          }
        ]
      }
    } as VideoContentFields

    render(
      <VideoProvider value={{ content: regularVideo }}>
        <DialogDownload open onClose={onClose} />
      </VideoProvider>
    )

    const termsCheckbox = screen.getByRole('checkbox')
    fireEvent.click(termsCheckbox)

    // For regular URLs, should show submit button (form submission)
    const downloadButton = screen.getByRole('button', { name: 'Download' })
    expect(downloadButton).toHaveAttribute('type', 'submit')
    expect(downloadButton).not.toHaveAttribute('href')
  })

  it('should display download quality options in correct order (highest, high, low)', async () => {
    render(
      <VideoProvider value={{ content: video }}>
        <DialogDownload open onClose={onClose} />
      </VideoProvider>
    )

    const qualitySelect = screen.getByRole('combobox')
    await userEvent.click(qualitySelect)

    const options = await screen.findAllByRole('option')
    const optionTexts = options.map((option) => option.textContent ?? '')

    expect(optionTexts[0]).toContain('High')
    expect(optionTexts[0]).toContain('2.2')
    expect(optionTexts[1]).toContain('Low')
  })
})
