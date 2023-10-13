import { useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import castArray from 'lodash/castArray'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import Globe1Icon from '@core/shared/ui/icons/Globe1'

import { GetLanguages } from '../../../../__generated__/GetLanguages'
import { GET_LANGUAGES } from '../../Editor/EditToolbar/Menu/LanguageMenuItem/LanguageDialog'

import { LanguageFilterDialog } from './LanguageFilterDialog'

const DEFAULT_LANGUAGE_ID = '529'

export function LanguageFilter(): ReactElement {
  const { query } = useRouter()
  const [open, setOpen] = useState(false)

  const languageIds = castArray(query.languageIds)

  const { data, loading } = useQuery<GetLanguages>(GET_LANGUAGES, {
    variables: { languageId: DEFAULT_LANGUAGE_ID }
  })

  console.log(languageIds)

  // update to be a function that loops through the languageIds array then renders the langauges
  const defaultLanguage = data?.languages
    .find((language) => language.id === DEFAULT_LANGUAGE_ID)
    ?.name?.find(({ primary }) => primary)?.value

  return (
    <>
      <Button
        data-testid="LanguageFilterButton"
        variant="outlined"
        onClick={() => setOpen(true)}
        startIcon={<Globe1Icon />}
        sx={{
          border: 'none',
          '&:hover': {
            border: 'none'
          }
        }}
      >
        {defaultLanguage}
      </Button>
      <LanguageFilterDialog
        open={open}
        onClose={() => setOpen(false)}
        languages={data?.languages}
        loading={loading}
      />
    </>
  )
}
