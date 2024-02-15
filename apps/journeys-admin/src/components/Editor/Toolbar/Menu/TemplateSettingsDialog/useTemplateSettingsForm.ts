import { FormikContextType, useFormikContext } from 'formik'

import { JourneyUpdateInput } from '../../../../../../__generated__/globalTypes'

export interface TemplateSettingsFormValues extends JourneyUpdateInput {
  featured: boolean
}

export function useTemplateSettingsForm(): FormikContextType<TemplateSettingsFormValues> {
  return useFormikContext<TemplateSettingsFormValues>()
}
