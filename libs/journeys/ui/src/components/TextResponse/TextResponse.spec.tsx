import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikContextType, FormikProvider, FormikValues } from 'formik'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { TextResponseType } from '../../../__generated__/globalTypes'
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
  children: []
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
    const { getByLabelText } = render(<TextResponseMock />)

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
      children: []
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
      children: []
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
      'textResponse-label'
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

  it('should show "Required" error message if field is required and left empty', async () => {
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

    fireEvent.blur(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })

  it('should show email validation error for invalid email', async () => {
    const emailBlock: TreeBlock<TextResponseFields> = {
      ...block,
      type: TextResponseType.email
    }

    render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponse {...emailBlock} />
        </SnackbarProvider>
      </JourneyProvider>
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'invalid-email' }
    })
    fireEvent.blur(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument()
    })
  })

  it('should not submit if required validation fails', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseSubmissionEventCreate: {
          id: 'uuid'
        }
      }
    }))

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

    fireEvent.blur(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
      expect(result).not.toHaveBeenCalled()
    })
  })

  it('should not submit if email validation fails', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseSubmissionEventCreate: {
          id: 'uuid'
        }
      }
    }))

    const emailBlock: TreeBlock<TextResponseFields> = {
      ...block,
      type: TextResponseType.email
    }

    render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponse {...emailBlock} />
        </SnackbarProvider>
      </JourneyProvider>
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'invalid-email' }
    })
    fireEvent.blur(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument()
      expect(result).not.toHaveBeenCalled()
    })
  })
})
