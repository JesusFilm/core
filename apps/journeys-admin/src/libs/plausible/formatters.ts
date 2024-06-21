import format from 'date-fns/format'
import isEqual from 'date-fns/isEqual'
import isSameYear from 'date-fns/isSameYear'

const THOUSAND = 1_000
const HUNDRED_THOUSAND = 100_000
const MILLION = 1_000_000
const HUNDRED_MILLION = 100_000_000
const BILLION = 1_000_000_000
const HUNDRED_BILLION = 100_000_000_000
const TRILLION = 1_000_000_000_000

export function numberFormatter(num: number): string {
  if (num >= THOUSAND && num < MILLION) {
    const thousands = num / THOUSAND
    if (thousands === Math.floor(thousands) || num >= HUNDRED_THOUSAND) {
      return Math.floor(thousands) + 'k'
    } else {
      return Math.floor(thousands * 10) / 10 + 'k'
    }
  } else if (num >= MILLION && num < BILLION) {
    const millions = num / MILLION
    if (millions === Math.floor(millions) || num >= HUNDRED_MILLION) {
      return Math.floor(millions) + 'M'
    } else {
      return Math.floor(millions * 10) / 10 + 'M'
    }
  } else if (num >= BILLION && num < TRILLION) {
    const billions = num / BILLION
    if (billions === Math.floor(billions) || num >= HUNDRED_BILLION) {
      return Math.floor(billions) + 'B'
    } else {
      return Math.floor(billions * 10) / 10 + 'B'
    }
  } else {
    return num.toString()
  }
}

function pad(num: number, size: number): string {
  return ('000' + num).slice(size * -1)
}

export function durationFormatter(duration: number): string {
  const hours = Math.floor(duration / 60 / 60)
  const minutes = Math.floor(duration / 60) % 60
  const seconds = Math.floor(duration - minutes * 60 - hours * 60 * 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${pad(seconds, 2)}s`
  } else {
    return `${seconds}s`
  }
}

export function formatDay(date: Date): string {
  if (isSameYear(date, new Date())) {
    return format(date, 'E, d MMM')
  } else {
    return format(date, 'E, d MMM yyyy')
  }
}

export function formatMonth(date: Date): string {
  if (isSameYear(date, new Date())) {
    return format(date, 'MMMM')
  } else {
    return format(date, 'MMMM yyyy')
  }
}

export function formatDayShort(date: Date, includeYear = false): string {
  if (includeYear) {
    return format(date, 'd MMM yy')
  } else {
    return format(date, 'd MMM')
  }
}

export function formatDateRange(from: Date, to: Date): string {
  if (isEqual(from, to)) {
    return formatDay(from)
  } else if (isSameYear(from, to)) {
    const includeYear = !isSameYear(from, new Date())
    return `${formatDayShort(from, false)} - ${formatDayShort(to, includeYear)}`
  } else {
    return `${formatDayShort(from, true)} - ${formatDayShort(to, true)}`
  }
}
