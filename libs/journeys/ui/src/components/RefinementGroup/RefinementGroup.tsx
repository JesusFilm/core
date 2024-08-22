import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'

interface RefinementGroupProps {
  refinement: RefinementListRenderState
  title: string
}

export function RefinementGroup({
  refinement,
  title
}: RefinementGroupProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <Box>
      <Typography variant="h6" color="primary.main" marginBottom={6}>
        {t(title)}
      </Typography>
      <Box color="text.primary">
        {refinement.items.length > 0 ? (
          <FormGroup>
            {refinement.items.map((item) => (
              <FormControlLabel
                key={item.value}
                control={
                  <Checkbox
                    checked={item.isRefined}
                    onClick={() => refinement.refine(item.value)}
                    size="small"
                  />
                }
                label={item.label}
              />
            ))}
          </FormGroup>
        ) : (
          <Typography>
            {t(
              `Sorry, there are no ${title.toLowerCase()} available for this search. Try a broader search!`
            )}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
