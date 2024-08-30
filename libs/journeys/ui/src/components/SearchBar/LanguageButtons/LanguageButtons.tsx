import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { MouseEvent, MouseEventHandler, ReactElement } from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Globe1Icon from '@core/shared/ui/icons/Globe1'
import X2Icon from '@core/shared/ui/icons/X2'

const MAX_DISPLAYED_LANGUAGES = 2

const StyledButton = styled(Button)(({ theme }) => ({
  width: 168,
  borderRadius: 32,
  gap: 0,
  padding: '8px 20px 8px 20px',
  border: `2px solid ${theme.palette.text.primary}${
    theme.palette.mode === 'dark' ? '2E' : '1A'
  }`,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('lg')]: {
    padding: 4
  }
}))

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
              isRefined
              key={index}
              content={selectedLanguage.split(', ')[0]}
              handleClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation()
                refine(selectedLanguage)
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

interface LanguageButtonProps {
  content: string
  index?: number
  isRefined?: boolean
  handleClick?: MouseEventHandler<HTMLButtonElement> | undefined
}

function LanguageButton({
  content,
  index,
  isRefined = false,
  handleClick
}: LanguageButtonProps): ReactElement {
  return (
    <StyledButton
      key={index}
      size="small"
      color="inherit"
      onClick={handleClick}
      startIcon={<Globe1Icon />}
      endIcon={isRefined ? <X2Icon /> : <ChevronDown />}
    >
      {content}
    </StyledButton>
  )
}
