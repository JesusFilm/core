import { createFilterOptions } from '@mui/material/useAutocomplete'

import { Language } from '../../../../libs/useLanguages'

export const filterOptions = createFilterOptions<Language>({
  stringify: (option) =>
    [option.displayName, option.nativeName?.value, option.id]
      .filter(Boolean)
      .join(' ')
})
