import { fireEvent, render, waitFor } from '@testing-library/react'
import { Form, Formik } from 'formik'

import { SubmitListener } from '.'

describe('SubmitListener', () => {
  it('automatically submits when updated', async () => {
    const handleSubmit = jest.fn()
    const { getByRole } = render(
      <Formik initialValues={{ name: '' }} onSubmit={handleSubmit}>
        {({ values, handleChange }) => (
          <Form>
            <input
              id="name"
              name="name"
              value={values.name}
              onChange={handleChange}
              aria-label="name"
            />
            <SubmitListener />
          </Form>
        )}
      </Formik>
    )
    fireEvent.change(getByRole('textbox', { name: 'name' }), {
      target: { value: 'wow' }
    })
    jest.runAllTimers()
    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith(
        { name: 'wow' },
        expect.any(Object)
      )
    )
  })
})
