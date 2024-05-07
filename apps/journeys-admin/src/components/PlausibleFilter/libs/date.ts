import format from 'date-fns/format'
import isEqual from 'date-fns/isEqual'
import isSameYear from 'date-fns/isSameYear'

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
