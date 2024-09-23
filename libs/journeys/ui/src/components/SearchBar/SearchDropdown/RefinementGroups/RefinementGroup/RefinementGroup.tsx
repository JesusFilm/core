import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import { useTheme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { type ReactElement, useEffect, useRef, useState } from 'react'
import { useSearchBox } from 'react-instantsearch'

import { stripLanguageFromQuery } from '../../../../../libs/algolia/languageUtils'
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

    refine(language)

    if (isLanguageRefined(language)) {
      const strippedQuery = stripLanguageFromQuery(language, query)
      if (query !== strippedQuery) refineQuery(strippedQuery)
    }
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
                label={<TooltipLabelWrapper label={item.label} />}
                sx={{
                  maxWidth: '90%',
                  [theme.breakpoints.up('lg')]: {
                    '& .MuiFormControlLabel-label': {
                      width: '90%'
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

function TooltipLabelWrapper({ label }: { label: string }): ReactElement {
  const theme = useTheme()
  const textRef = useRef<HTMLSpanElement>(null)
  const [isTextTruncated, setIsTextTruncated] = useState(false)

  useEffect(() => {
    function checkTruncation(): void {
      if (textRef.current != null) {
        setIsTextTruncated(
          textRef.current.scrollWidth > textRef.current.clientWidth
        )
      }
    }

    checkTruncation()
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [label])

  return (
    <Tooltip
      arrow
      title={label}
      placement="top"
      disableHoverListener={!isTextTruncated}
    >
      <Typography
        ref={textRef}
        sx={{
          [theme.breakpoints.up('lg')]: {
            display: 'block',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }
        }}
      >
        {label}
      </Typography>
    </Tooltip>
  )
}
