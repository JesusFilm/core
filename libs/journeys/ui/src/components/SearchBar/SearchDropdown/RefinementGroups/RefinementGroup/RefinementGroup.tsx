import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { type ReactElement } from 'react'
import { useSearchBox } from 'react-instantsearch'

import { normalizeLanguage } from '../../../../../libs/algolia/normalizeLanguage'
import { useSearchBar } from '../../../../../libs/algolia/SearchBarProvider'

interface RefinementGroupProps {
  title: string
  refinement: RefinementListRenderState
}

export function RefinementGroup({
  title,
  refinement
}: RefinementGroupProps): ReactElement {
  const {
    dispatch,
    state: { continentLanguages }
  } = useSearchBar()
  const theme = useTheme()
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

  function handleClick(language: string, isSelected: boolean): void {
    dispatch({
      type: 'SelectLanguageContinent',
      continent: title,
      language,
      isSelected
    })
    if (isLanguageRefined(language)) stripLanguageFromQuery(language)
    refine(language)
  }

  function isItemChecked(item: { label: string; isRefined: boolean }): boolean {
    return (
      (item.isRefined && continentLanguages[title]?.includes(item.label)) ??
      false
    )
  }

  function isItemDisabled(itemLabel: string): boolean {
    return Object.entries(continentLanguages).some(
      ([continent, languages]) =>
        continent !== title && languages.includes(itemLabel)
    )
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
                key={item.label}
                control={
                  <Checkbox
                    size="small"
                    checked={isItemChecked(item)}
                    disabled={isItemDisabled(item.label)}
                    onClick={() => handleClick(item.label, !item.isRefined)}
                  />
                }
                label={item.label}
                sx={{
                  maxWidth: '95%',
                  [theme.breakpoints.up('lg')]: {
                    '& .MuiFormControlLabel-label': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }
                }}
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
