import { isEqual, reduce } from 'lodash'

// export const getDirtyValues = <T>(values, initialValues: T): object => {
//   const data = { ...values }
//   const keyValues = Object.keys(data)

//   const dirtyValues = keyValues.filter(
//     (key) => data[key] !== initialValues[key]
//   )

//   keyValues.forEach((key) => {
//     if (!dirtyValues.includes(key)) delete data[key]
//   })

//   return data
// }

export const getDirtyValues = <T extends object>(
  values: T,
  initialValues: T
): Partial<T> => {
  const data = { ...values }

  console.log({ data })

  const findDirtyValues = (current: any, initial: any): any => {
    return Object.keys(current).reduce<Partial<T>>((acc, key) => {
      const currentValue = current[key]
      const initialValue = initial[key]

      // Check for nested objects, excluding arrays and null values
      if (
        typeof currentValue === 'object' &&
        currentValue !== null &&
        initialValue != null
      ) {
        const nestedDirtyValues = findDirtyValues(currentValue, initialValue)

        // Only include nested object if it has dirty values
        if (Object.keys(nestedDirtyValues).length > 0) {
          acc[key] = nestedDirtyValues
        }
      }
      // Include field if it has changed
      else if (currentValue !== initialValue) {
        acc[key] = currentValue
      }

      return acc
    }, {})
  }

  return findDirtyValues(data, initialValues)
}
