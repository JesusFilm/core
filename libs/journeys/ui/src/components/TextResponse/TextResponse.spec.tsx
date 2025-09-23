import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikContextType, FormikProvider, FormikValues } from 'formik'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import type { TreeBlock } from '../../libs/block'
import { JourneyProvider } from '../../libs/JourneyProvider'

import { TextResponseFields } from './__generated__/TextResponseFields'
import { TextResponse } from './TextResponse'

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useField: jest.fn().mockReturnValue([
    { value: 'test', onChange: jest.fn(), onBlur: jest.fn() },
    { error: 'test', touched: true }
  ])
}))

const block: TreeBlock<TextResponseFields> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse0id',
  parentBlockId: '0',
  parentOrder: 0,
  label: 'Your answer here',
  placeholder: null,
  hint: null,
  minRows: null,
  required: null,
  integrationId: null,
  type: null,
  routeId: null,
  children: [],
  hideLabel: false
}

interface TextResponseMockProps {
  values?: FormikValues
  handleSubmit?: () => void
}

const TextResponseMock = ({
  values,
  handleSubmit
}: TextResponseMockProps): ReactElement => (
  <JourneyProvider>
    <SnackbarProvider>
      <Formik
        initialValues={{ ...values }}
        onSubmit={handleSubmit ?? noop}
        isSubmitting={true}
      >
        <TextResponse {...block} />
      </Formik>
    </SnackbarProvider>
  </JourneyProvider>
)

describe('TextResponse', () => {
  it('should have 1000 character max length', async () => {
    render(<TextResponseMock />)

    const responseField = screen.getByRole('textbox')

    await waitFor(() => {
      expect(responseField).toHaveAttribute('maxlength', '1000')
    })
  })

  it('should show default text if label is empty', async () => {
    const emptyLabelBlock: TreeBlock<TextResponseFields> = {
      __typename: 'TextResponseBlock',
      id: 'textResponse0.id',
      parentBlockId: '0',
      parentOrder: 0,
      label: '',
      placeholder: null,
      hint: null,
      minRows: null,
      required: null,
      integrationId: null,
      type: null,
      routeId: null,
      children: [],
      hideLabel: false
    }

    render(
      <JourneyProvider>
        <SnackbarProvider>
          <Formik initialValues={{}} onSubmit={noop}>
            <TextResponse {...emptyLabelBlock} />
          </Formik>
        </SnackbarProvider>
      </JourneyProvider>
    )

    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('should show default text if label has pure whitespace', async () => {
    const whitespaceLabelBlock: TreeBlock<TextResponseFields> = {
      __typename: 'TextResponseBlock',
      id: 'textResponse0.id',
      parentBlockId: '0',
      parentOrder: 0,
      label: '   ',
      placeholder: null,
      hint: null,
      minRows: null,
      integrationId: null,
      type: null,
      routeId: null,
      required: null,
      children: [],
      hideLabel: false
    }

    render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponse {...whitespaceLabelBlock} />
        </SnackbarProvider>
      </JourneyProvider>
    )

    expect(screen.getByLabelText('Label')).toBeInTheDocument()
  })

  it('should show placeholder text with only one whitespace inbetween words', () => {
    const blockWithPlaceholder: TreeBlock<TextResponseFields> = {
      ...block,
      placeholder: '     Enter      your      thoughts      here     '
    }

    render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponse {...blockWithPlaceholder} />
        </SnackbarProvider>
      </JourneyProvider>
    )

    expect(screen.getByRole('textbox')).toHaveAttribute(
      'placeholder',
      'Enter your thoughts here'
    )
  })

  it('should show empty placeholder text if placeholder is null', () => {
    render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponse {...block} />
        </SnackbarProvider>
      </JourneyProvider>
    )

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', '')
  })

  it('should be in a loading state when waiting for response', async () => {
    const { getByRole } = render(
      <Formik initialValues={{}} onSubmit={noop}>
        <FormikProvider
          value={
            {
              values: {},
              isSubmitting: true
            } as FormikContextType<FormikValues>
          }
        >
          <TextResponse {...block} />
        </FormikProvider>
      </Formik>
    )
    const textField = getByRole('textbox')

    await waitFor(() => expect(textField).toBeDisabled())
  })

  it('should not allow selection in editor', () => {
    render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponseMock />
        </SnackbarProvider>
      </JourneyProvider>
    )

    const response = screen.getByRole('textbox')
    fireEvent.click(response)
    expect(response.matches(':focus')).not.toBeTruthy()
  })

  it('should be able to render without formik context', () => {
    const { getAllByRole } = render(<TextResponse {...block} />)

    expect(getAllByRole('textbox')[0]).toBeInTheDocument()
  })

  it('should have correct aria-labelledby attribute', () => {
    render(<TextResponseMock />)
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-labelledby',
      'textResponse-label-textResponse0id'
    )
  })

  it('should show asterisk if required', () => {
    const requiredBlock: TreeBlock<TextResponseFields> = {
      ...block,
      required: true
    }

    render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponse {...requiredBlock} />
        </SnackbarProvider>
      </JourneyProvider>
    )

    expect(screen.getByText('Your answer here*')).toBeInTheDocument()
  })

  it('should not show asterisk if not required', () => {
    const notRequiredBlock: TreeBlock<TextResponseFields> = {
      ...block,
      required: false
    }

    render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponse {...notRequiredBlock} />
        </SnackbarProvider>
      </JourneyProvider>
    )

    expect(screen.queryByText('Your answer here*')).not.toBeInTheDocument()
    expect(screen.getByText('Your answer here')).toBeInTheDocument()
  })

  it('should show errors', () => {
    const requiredBlock: TreeBlock<TextResponseFields> = {
      ...block,
      required: true
    }

    render(
      <FormikProvider
        value={
          {
            values: { [requiredBlock.id]: '' },
            touched: { [requiredBlock.id]: true },
            errors: { [requiredBlock.id]: 'This field is required' }
          } as unknown as FormikContextType<FormikValues>
        }
      >
        <TextResponse {...requiredBlock} />
      </FormikProvider>
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should not show label if hideLabel is true', () => {
    const hideLabelBlock: TreeBlock<TextResponseFields> = {
      ...block,
      hideLabel: true
    }

    render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponse {...hideLabelBlock} />
        </SnackbarProvider>
      </JourneyProvider>
    )

    // The label should not be visible when hideLabel is true
    expect(screen.queryByText('Your answer here')).not.toBeInTheDocument()
    expect(screen.queryByText('Label')).not.toBeInTheDocument()

    // The textbox should still be present
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
