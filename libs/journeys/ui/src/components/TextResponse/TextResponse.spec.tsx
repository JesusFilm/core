import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikContextType, FormikProvider, FormikValues } from 'formik'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
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
  hanldeSubmit?: () => void
}

const TextResponseMock = ({
  values,
  hanldeSubmit
}: TextResponseMockProps): ReactElement => (
  <JourneyProvider>
    <SnackbarProvider>
      <Formik
        initialValues={{ ...values }}
        onSubmit={hanldeSubmit ?? noop}
        isSubmitting={true}
      >
        <TextResponse {...block} uuid={() => 'uuid'} />
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
      <MockedProvider mocks={[]} addTypename={false}>
        <JourneyProvider>
          <SnackbarProvider>
            <Formik initialValues={{}} onSubmit={noop}>
              <TextResponse {...emptyLabelBlock} uuid={() => 'uuid'} />
            </Formik>
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByLabelText('Your answer here')).toBeInTheDocument()
  })

  it('should be in a loading state when waiting for response', async () => {
    const { getByRole } = render(
      <ApolloLoadingProvider>
        <Formik initialValues={{}} onSubmit={noop}>
          <FormikProvider
            value={
              {
                values: {},
                isSubmitting: true
              } as FormikContextType<FormikValues>
            }
          >
            <TextResponse {...block} uuid={() => 'uuid'} />
          </FormikProvider>
        </Formik>
      </ApolloLoadingProvider>
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
})
