/* eslint-disable i18next/no-literal-string */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import { ReactElement, useState } from 'react'

const calculateWesternEaster = (year: number): Date => {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1

  return new Date(year, month - 1, day)
}

const calculateOrthodoxEaster = (year: number): Date => {
  const a = year % 4
  const b = year % 7
  const c = year % 19
  const d = (19 * c + 15) % 30
  const e = (2 * a + 4 * b - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31)
  const day = ((d + e + 114) % 31) + 1

  const julianDate = new Date(year, month - 1, day)
  return new Date(julianDate.getTime() + 13 * 24 * 60 * 60 * 1000) // Add 13 days for Gregorian calendar
}

const calculatePassover = (year: number): Date => {
  // Approximation of Jewish Passover (usually starts on the evening before Western Easter)
  const westernEaster = calculateWesternEaster(year)
  return new Date(westernEaster.getTime() - 24 * 60 * 60 * 1000)
}

export const EasterDates = (): ReactElement => {
  const currentYear = new Date().getFullYear()
  const westernEaster = calculateWesternEaster(currentYear)
  const orthodoxEaster = calculateOrthodoxEaster(currentYear)
  const passover = calculatePassover(currentYear)
  const [expanded, setExpanded] = useState<boolean>(false)

  const formatDate = (date: Date): string => {
    // Format date with Russian locale
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleAccordionChange = (): void => {
    setExpanded(!expanded)
  }

  return (
    <div
      className="w-full relative overflow-hidden bg-gradient-to-tr from-blue-400 via-amber-500 to-red-600 bg-blend-multiply animate-mesh-gradient hover:animate-mesh-gradient-fast rounded-lg shadow-lg group"
      data-testid="EasterDates"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 via-amber-500/40 to-red-500/40 blur-xl"
        style={{ mixBlendMode: 'overlay' }}
      />
      <div className="absolute inset-0 bg-[url(https://grainy-gradients.vercel.app/noise.svg)] opacity-50 brightness-100 contrast-150 mix-blend-overlay" />
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
            <h4 className="font-bold text-white text-3xl text-opacity-90">
              Когда отмечается Пасха в {currentYear} году?
            </h4>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '0 1.5rem 1.5rem' }}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-black/50 mix-blend-multiply">
                  Западная Пасха (католическая/протестантская)
                </h3>
                <p className="text-5xl font-extrabold text-black/85 mix-blend-multiply tracking-tighter">
                  {formatDate(westernEaster)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black/50 mix-blend-multiply">
                  Православная
                </h3>
                <p className="text-xl font-extrabold text-black/75 mix-blend-multiply">
                  {formatDate(orthodoxEaster)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black/50 mix-blend-multiply">
                  Еврейская Пасха (Песах)
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
