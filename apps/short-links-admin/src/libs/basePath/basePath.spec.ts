import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { BASE_PATH, withBasePath } from './basePath'

describe('withBasePath', () => {
  it('prefixes app-relative paths', () => {
    expect(withBasePath('/api/login')).toBe('/s/dashboard/api/login')
    expect(withBasePath('api/qr?url=x')).toBe('/s/dashboard/api/qr?url=x')
    expect(withBasePath('/')).toBe('/s/dashboard')
  })

  it('does not prefix twice', () => {
    expect(withBasePath('/s/dashboard/links')).toBe('/s/dashboard/links')
    expect(withBasePath('/s/dashboard')).toBe('/s/dashboard')
  })

  it('prefixes paths that merely start with the same characters', () => {
    expect(withBasePath('/s/dashboards')).toBe('/s/dashboard/s/dashboards')
  })

  it('leaves absolute urls alone', () => {
    expect(withBasePath('https://jesus.film/s/abc')).toBe(
      'https://jesus.film/s/abc'
    )
    expect(withBasePath('//cdn.example.com/x.png')).toBe(
      '//cdn.example.com/x.png'
    )
  })
})

describe('BASE_PATH', () => {
  it('matches basePath in next.config.js', () => {
    const config = readFileSync(
      resolve(__dirname, '../../../next.config.js'),
      'utf8'
    )
    const match = /basePath:\s*'([^']+)'/.exec(config)

    expect(match?.[1]).toBe(BASE_PATH)
  })
})
