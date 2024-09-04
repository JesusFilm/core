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
  selectedLanguagesByContinent
}: RefinementGroupProps): ReactElement {
  const { items, refine } = refinement

  function handleClick(language: string, isRefined: boolean): void {
    if (handleLanguagesSelect != null)
      handleLanguagesSelect(title, language, isRefined)
    refine(language)
  }

  return (
    <Box>
      <Typography variant="h6" color="primary.main" marginBottom={6}>
        {title}
      </Typography>
      <Box color="text.primary">
        {items.length > 0 ? (
          <FormGroup>
            {items.map((item) => (
              <FormControlLabel
                key={item.value}
                control={
                  <Checkbox
                    checked={
                      (item.isRefined &&
                        selectedLanguagesByContinent?.[title]?.includes(
                          item.label
                        )) ??
                      false
                    }
                    disabled={Object.keys(
                      selectedLanguagesByContinent ?? {}
                    ).some(
                      (continent) =>
                        continent !== title &&
                        selectedLanguagesByContinent?.[continent]?.includes(
                          item.label
                        )
                    )}
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
