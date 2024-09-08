import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { type ReactElement } from 'react'
import { useSearchBox } from 'react-instantsearch'

interface RefinementGroupProps {
  title: string
  refinement: RefinementListRenderState
  handleSelectedContinent: (continent: string) => void
  selectedContinent?: string
}

export function normalizeLanguage(language: string): string {
  return language.toLowerCase().split(',')[0].trim()
}

export function RefinementGroup({
  title,
  refinement,
  handleSelectedContinent,
  selectedContinent
}: RefinementGroupProps): ReactElement {
  const { items, refine } = refinement
  const { query, refine: refineQuery } = useSearchBox()

  function stripLanguageFromQuery(language: string): void {
    const normalizedLanguage = normalizeLanguage(language)
    const hasLanguageInQuery = query.toLowerCase().includes(normalizedLanguage)
    if (hasLanguageInQuery) {
      const regEx = new RegExp(normalizedLanguage, 'ig')
      const strippedQuery = query.replace(regEx, '').trim()
      refineQuery(strippedQuery)
    }
  }

  function isLanguageRefined(language: string): boolean {
    const languageRefinement = items.find((item) => item.label === language)
    return languageRefinement !== undefined && !languageRefinement.isRefined
  }

  function handleClick(language: string): void {
    handleSelectedContinent(title)
    if (isLanguageRefined(language)) stripLanguageFromQuery(language)
    refine(language)
  }

  return (
    <Box>
      <Typography variant="h6" color="primary.main" marginBottom={6}>
        {title}
      </Typography>
      <Box color="text.primary" marginBottom={10}>
        {items.length > 0 ? (
          <FormGroup>
            {items.map((item) => (
              <FormControlLabel
                key={item.value}
                control={
                  <Checkbox
                    checked={item.isRefined}
                    onClick={() => handleClick(item.label)}
                    size="small"
                  />
                }
                label={item.label}
              />
            ))}
          </FormGroup>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  )
}
