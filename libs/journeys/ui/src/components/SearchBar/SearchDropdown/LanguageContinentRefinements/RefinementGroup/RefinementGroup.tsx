import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { type ReactElement } from 'react'

interface RefinementGroupProps {
  title: string
  refinement: RefinementListRenderState
  handleLanguagesSelect: (
    continent: string,
    language: string,
    isRefined: boolean
  ) => void
  selectedLanguagesByContinent?: Record<string, string[]>
}

export function RefinementGroup({
  title,
  refinement,
  handleLanguagesSelect,
  selectedLanguagesByContinent = {}
}: RefinementGroupProps): ReactElement {
  const { items, refine } = refinement

  function handleClick(language: string, isRefined: boolean): void {
    handleLanguagesSelect(title, language, isRefined)
    refine(language)
  }

  function isItemChecked(item: { label: string; isRefined: boolean }): boolean {
    return (
      (item.isRefined &&
        selectedLanguagesByContinent[title]?.includes(item.label)) ??
      false
    )
  }

  function isItemDisabled(itemLabel: string): boolean {
    return Object.entries(selectedLanguagesByContinent).some(
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
                key={item.value}
                control={
                  <Checkbox
                    checked={isItemChecked(item)}
                    disabled={isItemDisabled(item.label)}
                    onClick={() => handleClick(item.label, !item.isRefined)}
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
