export const calculateWesternEaster = (year: number): Date => {
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

export const calculateOrthodoxEaster = (year: number): Date => {
  const a = year % 4
  const b = year % 7
  const c = year % 19
  const d = (19 * c + 15) % 30
  const e = (2 * a + 4 * b - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31)
  const day = ((d + e + 114) % 31) + 1

  const julianDate = new Date(year, month - 1, day)
  return new Date(julianDate.getTime() + 13 * 24 * 60 * 60 * 1000)
}

export const calculatePassover = (year: number): Date => {
  const westernEaster = calculateWesternEaster(year)
  return new Date(westernEaster.getTime() - 24 * 60 * 60 * 1000)
}

export const getEasterCampaignYear = (date: Date = new Date()): number => {
  const currentYear = date.getFullYear()
  const orthodoxEaster = calculateOrthodoxEaster(currentYear)

  const currentDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )
  const orthodoxEasterDay = new Date(
    orthodoxEaster.getFullYear(),
    orthodoxEaster.getMonth(),
    orthodoxEaster.getDate()
  )

  return currentDay > orthodoxEasterDay ? currentYear + 1 : currentYear
}
