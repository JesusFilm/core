import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SubtitlesIcon from '@mui/icons-material/Subtitles'
import TitleIcon from '@mui/icons-material/Title'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import MuiAccordion from '@mui/material/Accordion'
import AccordianDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik } from 'formik'
import { ReactElement, ReactNode, SyntheticEvent, useState } from 'react'

import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

import { GetLanguages } from '../../../../__generated__/GetLanguages'
import type { VideoPageFilter } from '../VideosPage'

import { LanguagesFilter } from './LanguagesFilter'

const subtitleLanguageIds = [
  '411',
  '448',
  '483',
  '494',
  '496',
  '529',
  '531',
  '584',
  '1106',
  '1109',
  '1112',
  '1269',
  '1341',
  '1942',
  '1964',
  '3804',
  '3887',
  '3934',
  '3964',
  '3974',
  '4415',
  '4432',
  '4601',
  '4820',
  '4823',
  '5541',
  '5545',
  '5546',
  '5563',
  '6464',
  '6788',
  '7083',
  '7698',
  '16639',
  '20601',
  '20770',
  '21028',
  '21046',
  '21064',
  '21753',
  '21754',
  '22500',
  '22658',
  '23178',
  '53299',
  '53424',
  '139081',
  '139089',
  '140126',
  '184497',
  '184498',
  '184506',
  '184528'
]

interface AccordianProps {
  children: ReactNode
  heading: string
  headingIcon: ReactNode
  expanded: boolean
  onChange: (event: SyntheticEvent, isExpanded: boolean) => void
}

function Accordion({
  children,
  heading,
  headingIcon,
  expanded,
  onChange
}: AccordianProps): ReactElement {
  return (
    <MuiAccordion
      expanded={expanded}
      onChange={onChange}
      variant="outlined"
      disableGutters
      sx={{ '&:before': { opacity: 0 } }}
      TransitionProps={{ unmountOnExit: true }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ py: 2, px: 4 }}
        data-testid={`filter-item-${heading.toLowerCase()}`}
      >
        <Stack direction="row" spacing={2}>
          {headingIcon}
          <Typography>{heading}</Typography>
        </Stack>
      </AccordionSummary>
      <AccordianDetails sx={{ p: 4, backgroundColor: '#DCDDE5' }}>
        {children}
      </AccordianDetails>
    </MuiAccordion>
  )
}

interface FilterListProps {
  filter: VideoPageFilter
  onChange: (filter: VideoPageFilter) => void
  languagesData?: GetLanguages
  languagesLoading: boolean
}

export function FilterList({
  filter,
  onChange,
  languagesData,
  languagesLoading
}: FilterListProps): ReactElement {
  const [expanded, setExpanded] = useState<string | false>('panel1')
  const handleExpandChange =
    (panel: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  const subtitleLanguages = languagesData?.languages.filter((language) =>
    subtitleLanguageIds.includes(language.id)
  )

  function languageOptionFromIds(ids?: string[]): LanguageOption {
    if (ids == null || ids.length === 0) return { id: '' }

    const language = languagesData?.languages.find(
      (language) => language.id === ids[0]
    )

    if (language != null) {
      return {
        id: language.id,
        localName: language.name.find(({ primary }) => !primary)?.value,
        nativeName: language.name.find(({ primary }) => primary)?.value
      }
    }

    return { id: '' }
  }

  const initialValues = {
    language: languageOptionFromIds(filter.availableVariantLanguageIds),
    subtitleLanguage: languageOptionFromIds(filter.subtitleLanguageIds),
    title: filter.title
  }

  function handleSubmit(values: typeof initialValues): void {
    onChange({
      availableVariantLanguageIds:
        values.language != null && values.language.id !== ''
          ? [values.language.id]
          : undefined,
      subtitleLanguageIds:
        values.subtitleLanguage != null && values.subtitleLanguage.id !== ''
          ? [values.subtitleLanguage.id]
          : undefined,
      title:
        values.title != null && values.title !== '' ? values.title : undefined
    })
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, handleChange, handleBlur }) => (
        <Box data-testid="FilterList">
          <Accordion
            expanded={expanded === 'panel1'}
            onChange={handleExpandChange('panel1')}
            headingIcon={<VolumeUpIcon />}
            heading="Languages"
          >
            <LanguagesFilter
              onChange={(language) => setFieldValue('language', language)}
              value={values.language}
              languages={languagesData?.languages}
              loading={languagesLoading}
            />
          </Accordion>
          <Accordion
            expanded={expanded === 'panel2'}
            onChange={handleExpandChange('panel2')}
            headingIcon={<SubtitlesIcon />}
            heading="Subtitles"
          >
            <LanguagesFilter
              onChange={(subtitleLanguage) =>
                setFieldValue('subtitleLanguage', subtitleLanguage)
              }
              value={values.subtitleLanguage}
              languages={subtitleLanguages}
              loading={languagesLoading}
              helperText="54 languages"
            />
          </Accordion>
          <Accordion
            expanded={expanded === 'panel3'}
            onChange={handleExpandChange('panel3')}
            headingIcon={<TitleIcon />}
            heading="Title"
          >
            <TextField
              value={values.title}
              name="title"
              onChange={handleChange}
              onBlur={handleBlur}
              label="Search Titles"
              variant="outlined"
              helperText="724+ titles"
              fullWidth
            />
          </Accordion>
          <SubmitListener />
        </Box>
      )}
    </Formik>
  )
}
