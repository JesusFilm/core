import { useFormikContext } from 'formik'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import { useCallback, useEffect, useMemo, useState } from 'react'

export function SubmitListener(): null {
  const { submitForm, values, initialValues, isValid, status } =
    useFormikContext()
  const [lastValues, updateState] = useState(values)
  const [onBlurSubmit, setOnBlurSubmit] = useState(false)

  const debouncedSubmit = useMemo(
    () =>
      debounce(
        (): void => {
          void submitForm()
        },
        500,
        { maxWait: 3000 }
      ),
    [submitForm]
  )

  const handleSubmit = useCallback(() => {
    debouncedSubmit()
  }, [debouncedSubmit])

  const handleBlurSubmit = useCallback(() => {
    debouncedSubmit.flush()
  }, [debouncedSubmit])

  useEffect(() => {
    const valuesEqualLastValues = isEqual(lastValues, values)
    const valuesEqualInitialValues = isEqual(values, initialValues)

    if (!valuesEqualLastValues) updateState(values)
    if (status?.onBlurSubmit === true) setOnBlurSubmit(true)
    if (onBlurSubmit) {
      handleBlurSubmit()
    } else {
      if (!valuesEqualLastValues && !valuesEqualInitialValues && isValid)
        handleSubmit()
    }
  }, [
    values,
    isValid,
    initialValues,
    lastValues,
    handleSubmit,
    handleBlurSubmit,
    status,
    onBlurSubmit
  ])

  return null
}
