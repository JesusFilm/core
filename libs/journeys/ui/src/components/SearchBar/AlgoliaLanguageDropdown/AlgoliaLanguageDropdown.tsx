import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { useRefinementList } from 'react-instantsearch'

export function AlgoliaLanguageDropdown(): ReactElement {
  // create function that returns languages in their own continents
  const { items } = useRefinementList({
    attribute: 'languageId'
  })

  // items will contain languageIds
  // need to sort them into continents
  // languages -> countryLanguages -> country -> continents -> id

  console.log('items', items)

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        backgroundColor: '#FFFFFF'
      }}
    />
  )
}
