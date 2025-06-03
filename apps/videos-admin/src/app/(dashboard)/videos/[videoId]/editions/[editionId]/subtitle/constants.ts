import { mixed, object, string } from 'yup'

export const subtitleValidationSchema = object().shape({
  language: string().required('Language is required'),
  vttFile: mixed().nullable(),
  srtFile: mixed().nullable()
})
