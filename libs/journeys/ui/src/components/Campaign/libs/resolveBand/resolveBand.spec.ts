import { alpha } from '@mui/material/styles'

import {
  CampaignBandTheme,
  bandCssVariables,
  contrastText,
  resolveBand, overlayAlpha } from './resolveBand'

const light: CampaignBandTheme = {
  primaryColor: '#C52D3A',
  accentColor: '#F2B544',
  backgroundColor: '#FBF7F1',
  surfaceColor: '#FFFFFF',
  textColor: '#26262E',
  mutedColor: '#6D6F81',
  contrastBackgroundColor: '#26262E',
  contrastTextColor: '#FFFFFF'
}

const onPrimary = contrastText(light.primaryColor)
const onAccent = contrastText(light.accentColor)

describe('resolveBand', () => {
  describe('the table (PRD §4)', () => {
    it('none → backgroundColor / textColor / surfaceColor / primaryColor on-primary, muted from mutedColor', () => {
      expect(resolveBand({ backgroundKind: 'none' }, light)).toMatchObject({
        background: '#FBF7F1',
        text: '#26262E',
        heading: '#26262E',
        card: '#FFFFFF',
        muted: '#6D6F81',
        button: '#C52D3A',
        buttonLabel: onPrimary
      })
    })

    it('surface → surfaceColor / textColor / backgroundColor, muted from mutedColor', () => {
      expect(resolveBand({ backgroundKind: 'surface' }, light)).toMatchObject({
        background: '#FFFFFF',
        text: '#26262E',
        card: '#FBF7F1',
        muted: '#6D6F81',
        button: '#C52D3A',
        buttonLabel: onPrimary
      })
    })

    it('primary → primaryColor / on-primary / on-primary at low alpha / on-primary fill with primaryColor label', () => {
      expect(resolveBand({ backgroundKind: 'primary' }, light)).toMatchObject({
        background: '#C52D3A',
        text: onPrimary,
        card: alpha(onPrimary, 0.12),
        muted: alpha(onPrimary, 0.7),
        button: onPrimary,
        buttonLabel: '#C52D3A'
      })
    })

    it('contrast → contrastBackgroundColor / contrastTextColor / contrast text at low alpha / accentColor on-accent, eyebrow in accentColor', () => {
      expect(resolveBand({ backgroundKind: 'contrast' }, light)).toMatchObject({
        background: '#26262E',
        text: '#FFFFFF',
        card: alpha('#FFFFFF', 0.12),
        muted: alpha('#FFFFFF', 0.7),
        button: '#F2B544',
        buttonLabel: onAccent,
        eyebrow: '#F2B544'
      })
    })

    it('custom → the section backgroundColor with text computed from that hex', () => {
      const dark = resolveBand(
        { backgroundKind: 'custom', backgroundColor: '#102030' },
        light
      )
      expect(dark).toMatchObject({
        background: '#102030',
        text: contrastText('#102030'),
        card: alpha(contrastText('#102030'), 0.12),
        button: '#C52D3A',
        buttonLabel: onPrimary
      })
      expect(dark.text).toBe('#fff')

      const pale = resolveBand(
        { backgroundKind: 'custom', backgroundColor: '#FFFBE6' },
        light
      )
      expect(pale.text).toBe(contrastText('#FFFBE6'))
      expect(pale.text).not.toBe('#fff')
    })

    it('computes on-primary and on-accent by luminance, never a stored white', () => {
      const darkPrimary = resolveBand(
        { backgroundKind: 'primary' },
        { ...light, primaryColor: '#101010' }
      )
      expect(darkPrimary.text).toBe('#fff')
      const palePrimary = resolveBand(
        { backgroundKind: 'primary' },
        { ...light, primaryColor: '#FFF4CC' }
      )
      expect(palePrimary.text).toBe('rgba(0, 0, 0, 0.87)')
      expect(onAccent).toBe('rgba(0, 0, 0, 0.87)')
    })

    it('derives borders from the band text at low alpha on every row', () => {
      expect(resolveBand({ backgroundKind: 'none' }, light).border).toBe(
        alpha('#26262E', 0.12)
      )
      expect(resolveBand({ backgroundKind: 'contrast' }, light).border).toBe(
        alpha('#FFFFFF', 0.12)
      )
    })
  })

  describe('section overrides', () => {
    it('layer headingColor, textColor, buttonColor, buttonTextColor and accentColor on top of every row', () => {
      const overrides = {
        headingColor: '#111111',
        textColor: '#222222',
        buttonColor: '#333333',
        buttonTextColor: '#444444',
        accentColor: '#555555'
      }
      for (const backgroundKind of [
        'none',
        'surface',
        'primary',
        'contrast',
        'custom',
        'image'
      ] as const) {
        expect(
          resolveBand(
            { backgroundKind, backgroundColor: '#ABCDEF', ...overrides },
            light
          )
        ).toMatchObject({
          heading: '#111111',
          text: '#222222',
          muted: alpha('#222222', 0.7),
          border: alpha('#222222', 0.12),
          button: '#333333',
          buttonLabel: '#444444',
          eyebrow: '#555555',
          accent: '#555555'
        })
      }
    })

    it('uses the text override for the heading when only textColor is overridden', () => {
      expect(
        resolveBand({ backgroundKind: 'none', textColor: '#222222' }, light)
          .heading
      ).toBe('#222222')
    })

    it('button fallback: section buttonColor → the table, label computed for an overridden fill', () => {
      const band = resolveBand(
        { backgroundKind: 'contrast', buttonColor: '#FFFFFF' },
        light
      )
      expect(band.button).toBe('#FFFFFF')
      expect(band.buttonLabel).toBe(contrastText('#FFFFFF'))
      expect(resolveBand({ backgroundKind: 'contrast' }, light).button).toBe(
        '#F2B544'
      )
    })
  })

  it('exposes the resolved colours as CSS variables', () => {
    const band = resolveBand({ backgroundKind: 'contrast' }, light)
    expect(bandCssVariables(band)).toEqual({
      '--campaign-band-background': '#26262E',
      '--campaign-band-text': '#FFFFFF',
      '--campaign-band-heading': '#FFFFFF',
      '--campaign-band-muted': alpha('#FFFFFF', 0.7),
      '--campaign-band-card': alpha('#FFFFFF', 0.12),
      '--campaign-band-border': alpha('#FFFFFF', 0.12),
      '--campaign-band-eyebrow': '#F2B544',
      '--campaign-band-accent': '#F2B544',
      '--campaign-band-button': '#F2B544',
      '--campaign-band-button-label': onAccent
    })
  })

  it('maps backgroundOverlay to the cover overlay alpha, medium when null', () => {
    expect(overlayAlpha('light')).toBe(0.3)
    expect(overlayAlpha('medium')).toBe(0.55)
    expect(overlayAlpha('heavy')).toBe(0.75)
    expect(overlayAlpha(null)).toBe(0.55)
    expect(overlayAlpha(undefined)).toBe(0.55)
  })
})
