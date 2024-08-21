import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'
import { useRefinementList } from 'react-instantsearch'

export function LangaugeRefinement(): ReactElement {
  const { t } = useTranslation('apps-watch')

  const { items, refine } = useRefinementList({
    attribute: 'languageEnglishName'
  })

  return (
    <Box>
      <Typography variant="h6" color='primary.main' marginBottom={6}>{t('Languages')}</Typography>
      <Box color='text.primary'>
        <FormGroup>
          {items.map((item) => (
            <FormControlLabel key={item.value} control={
              <Checkbox checked={item.isRefined} onClick={() => refine(item.value)} size='small' />
            } label={item.label} />
          ))}
        </FormGroup>
      </Box>
    </Box>
  )
}
