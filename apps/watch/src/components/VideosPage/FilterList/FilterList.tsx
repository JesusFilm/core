import { ReactElement, ReactNode, SyntheticEvent, useState } from 'react'
import MuiAccordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordianDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import SubtitlesIcon from '@mui/icons-material/Subtitles'
import TitleIcon from '@mui/icons-material/Title'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import TextField from '@mui/material/TextField'
import { useQuery } from '@apollo/client'
import { Formik } from 'formik'
import { SubmitListener } from '@core/shared/ui/SubmitListener'
import { GetLanguages } from '../../../../__generated__/GetLanguages'
import { GET_LANGUAGES, VideoPageFilter } from '../VideosPage'
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
}

export function FilterList({
  filter,
  onChange
}: FilterListProps): ReactElement {
  const [expanded, setExpanded] = useState<string | false>(false)
  const handleExpandChange =
    (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }
  const { data, loading } = useQuery<GetLanguages>(GET_LANGUAGES, {
    variables: { languageId: '529' }
  })

  const subtitleLanguages = data?.languages.filter((language) =>
    subtitleLanguageIds.includes(language.id)
  )

  function languageOptionFromIds(ids?: string[]): LanguageOption {
    if (ids == null || ids.length === 0) return { id: '' }

    const language = data?.languages.find((language) => language.id === ids[0])

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
        <Box>
          <Accordion
            expanded={expanded === 'panel1'}
            onChange={handleExpandChange('panel1')}
            headingIcon={<VolumeUpIcon />}
            heading="Languages"
          >
            <LanguagesFilter
              onChange={(language) => setFieldValue('language', language)}
              value={values.language}
              languages={data?.languages}
              loading={loading}
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
              loading={loading}
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
