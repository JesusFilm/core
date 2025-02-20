/**
 * Extracts the element type from an array type
 * @example
 * type StringArray = string[]
 * type Item = ArrayElement<StringArray> // string
 */
export type ArrayElement<T> = T extends Array<infer U> ? U : never
