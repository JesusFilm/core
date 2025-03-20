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
  hint: null,
  minRows: null,
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

    const responseField = getByLabelText('Your answer here')

    await waitFor(() => {
      expect(responseField).toHaveAttribute('maxlength', '1000')
    })
  })

  it('should show your answer here if label is empty', async () => {
    const emptyLabelBlock: TreeBlock<TextResponseFields> = {
      __typename: 'TextResponseBlock',
      id: 'textResponse0.id',
      parentBlockId: '0',
      parentOrder: 0,
      label: '',
      hint: null,
      minRows: null,
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

    expect(screen.getByLabelText('Your answer here')).toBeInTheDocument()
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
    const { getAllByRole } = render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponseMock />
        </SnackbarProvider>
      </JourneyProvider>
    )

    const response = getAllByRole('textbox')[0]
    fireEvent.click(response)
    expect(response.matches(':focus')).not.toBeTruthy()
  })

  it('should be able to render without formik context', () => {
    const { getAllByRole } = render(<TextResponse {...block} />)

    expect(getAllByRole('textbox')[0]).toBeInTheDocument()
  })
})
