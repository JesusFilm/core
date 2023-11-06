import { FormikContextType, useFormikContext } from 'formik'

import { JourneyUpdateInput } from '../../../../../../__generated__/globalTypes'

export interface TemplateSettingsFormValues extends JourneyUpdateInput {
  featured: boolean
  language: {
    id: string
    localName: string
    nativeName: string
  }
}

export function useTemplateSettingsForm(): FormikContextType<TemplateSettingsFormValues> {
  return useFormikContext<TemplateSettingsFormValues>()
}
