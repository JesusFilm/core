/* eslint-disable i18next/no-literal-string */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useEffect, useState } from 'react'

import {
  calculateOrthodoxEaster,
  calculatePassover,
  calculateWesternEaster,
  getEasterCampaignYear
} from '../../../../libs/easterDates'

export interface EasterDatesProps {
  title: string
  westernEasterLabel: string
  orthodoxEasterLabel: string
  passoverLabel: string
  locale?: string
  year?: number
}

export const EasterDates = ({
  title,
  westernEasterLabel,
  orthodoxEasterLabel,
  passoverLabel,
  locale = 'en-US',
  year = getEasterCampaignYear()
}: EasterDatesProps): ReactElement => {
  const westernEaster = calculateWesternEaster(year)
  const orthodoxEaster = calculateOrthodoxEaster(year)
  const passover = calculatePassover(year)
  const smUp = useMediaQuery('(min-width: 640px)')
  const [expanded, setExpanded] = useState<boolean>(smUp)

  useEffect(() => {
    setExpanded(smUp)
  }, [smUp])

  // Define date options internally
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(locale, dateOptions)
  }

  const handleAccordionChange = (): void => {
    setExpanded(!expanded)
  }

  return (
    <div
      className="animate-mesh-gradient hover:animate-mesh-gradient-fast group relative w-full overflow-hidden rounded-lg bg-gradient-to-tr from-blue-400 via-amber-500 to-red-600 bg-blend-multiply shadow-lg"
      data-testid="EasterDates"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 via-amber-500/40 to-red-500/40 blur-xl"
        style={{ mixBlendMode: 'overlay' }}
      />
      <div className="absolute inset-0 bg-[url(https://grainy-gradients.vercel.app/noise.svg)] opacity-50 mix-blend-overlay brightness-100 contrast-150" />
      <div className="relative z-10">
        <Accordion
          expanded={expanded}
          onChange={handleAccordionChange}
          sx={{
            background: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(0, 0, 0, 0.7)' }} />}
            aria-controls="easter-dates-content"
            id="easter-dates-header"
            sx={{
              padding: '1.5rem',
              '& .MuiAccordionSummary-content': {
                margin: 0
              }
            }}
          >
            <h4 className="text-opacity-90 text-2xl font-bold text-black/85 xl:text-3xl">
              {title.replace('{year}', year.toString())}
            </h4>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '0 1.5rem 1.5rem' }}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-black/50 mix-blend-multiply">
                  {westernEasterLabel}
                </h3>
                <p className="text-5xl font-extrabold tracking-tighter text-black/85 mix-blend-multiply">
                  {formatDate(westernEaster)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black/50 mix-blend-multiply">
                  {orthodoxEasterLabel}
                </h3>
                <p className="text-xl font-extrabold text-black/75 mix-blend-multiply">
                  {formatDate(orthodoxEaster)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black/50 mix-blend-multiply">
                  {passoverLabel}
                </h3>
                <p className="text-xl font-extrabold text-black/75 mix-blend-multiply">
                  {formatDate(passover)}
                </p>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  )
}
