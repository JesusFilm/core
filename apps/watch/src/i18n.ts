/* eslint-disable import/dynamic-import-chunkname */
import { resolve } from 'path'

import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'de']

export const localesPath =
  process.env.VERCEL == null || process.env.CI != null
    ? resolve('../../libs/locales')
    : '../public/locales'

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale)) notFound()

  const appsWatch = (
    await import(
      /* webpackIgnore: true */
      `${localesPath}/${locale}/apps-watch.json`,
      { assert: { type: 'json' } }
    )
  ).default

  return {
    messages: { 'apps-watch': appsWatch }
  }
})
