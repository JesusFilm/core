import { useFormikContext } from 'formik'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import { useCallback, useEffect, useMemo, useState } from 'react'

export function SubmitListener(): null {
  const { submitForm, values, initialValues, isValid } = useFormikContext()
  const [lastValues, updateState] = useState(values)

  const debouncedSubmit = useMemo(
    () =>
      debounce(
        (): void => {
          void submitForm()
        },
        500,
        { maxWait: 1500 }
      ),
    [submitForm]
  )

  const handleSubmit = useCallback(() => {
    debouncedSubmit()
  }, [debouncedSubmit])

  useEffect(() => {
    const valuesEqualLastValues = isEqual(lastValues, values)
    const valuesEqualInitialValues = isEqual(values, initialValues)

    if (!valuesEqualLastValues) updateState(values)

    if (!valuesEqualLastValues && !valuesEqualInitialValues && isValid)
      handleSubmit()
  }, [values, isValid, initialValues, lastValues, handleSubmit])

  return null
}
