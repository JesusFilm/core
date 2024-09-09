import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement } from 'react'

import { useSearchBar } from '../../../libs/algolia/SearchBarProvider'

import { LanguageButton } from './LanguageButton'

const MAX_DISPLAYED_LANGUAGES = 2

interface LanguageButtonsProps {
  onClick: () => void
  refinements: RefinementListRenderState
}

export function LanguageButtons({
  onClick,
  refinements
}: LanguageButtonsProps): ReactElement {
  const theme = useTheme()
  const { t } = useTranslation('apps-watch')
  const { items, refine } = refinements

  const { dispatch } = useSearchBar()

  const refinedItems = items
    .filter((item) => item.isRefined)
    .map((item) => item.label)

  const displayedLanguages = refinedItems.slice(0, MAX_DISPLAYED_LANGUAGES)

  const additionalLanguagesCount = Math.max(
    0,
    refinedItems.length - MAX_DISPLAYED_LANGUAGES
  )

  return (
    <Box
      component="button"
      onClick={onClick}
      data-testid="LanguageSelect"
      sx={{
        gap: 2,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: 'background.default',
        color: 'text.secondary',
        [theme.breakpoints.down('lg')]: {
          padding: 2,
          width: '100%',
          justifyContent: 'flex-end',
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8
        }
      }}
    >
      <Divider
        orientation="vertical"
        flexItem
        sx={{
          height: 35,
          alignSelf: 'center',
          marginRight: 6,
          [theme.breakpoints.down('lg')]: { display: 'none' }
        }}
        variant="middle"
      />
      {refinedItems?.length > 0 ? (
        <>
          {displayedLanguages.map((selectedLanguage: string, index: number) => (
            <LanguageButton
              isDropdown={false}
              key={index}
              content={selectedLanguage.split(', ')[0]}
              handleClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation()
                refine(selectedLanguage)
                dispatch({
                  type: 'RemoveLanguageContinents',
                  language: selectedLanguage
                })
              }}
            />
          ))}
          {additionalLanguagesCount > 0 && (
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', textAlign: 'center' }}
            >
              +{additionalLanguagesCount}
            </Typography>
          )}
        </>
      ) : (
        <LanguageButton content={t('Language')} />
      )}
    </Box>
  )
}
