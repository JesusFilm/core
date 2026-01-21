import path from 'path'

import { createStrapi } from '@strapi/strapi'

import { runMediaImport } from '../services/mediaImport/mediaImport'

async function main() {
  const appDir = path.resolve(__dirname, '..', '..')
  const distDir = path.resolve(appDir, 'dist')
  const strapi = await createStrapi({
    appDir,
    distDir,
    autoReload: false
  }).load()

  try {
    await runMediaImport(strapi)
    process.exit(0)
  } catch (error) {
    console.error('Media import failed:', error)
    process.exit(1)
  } finally {
    await strapi.destroy()
  }
}

void main()
