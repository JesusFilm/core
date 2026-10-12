import { readFileSync } from 'fs'
import { resolve } from 'path'

import { lighten } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import { createInstance } from 'i18next'
import { I18nContext } from 'next-i18next/pages'
import { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'

import { buildWorldMap } from './buildWorldMap'
import type { WorldAtlasTopology, WorldMapShapes } from './buildWorldMap'
import { WorldMap } from './WorldMap'

const atlas = JSON.parse(
  readFileSync(
    resolve(
      __dirname,
      '../../../../../../../../apps/journeys/public/countries-110m.json'
    ),
    'utf8'
  )
) as WorldAtlasTopology

const accentColor = '#EF3340'
const neutralColor = '#222222'
const WORLD_TRANSFORM = 'translate(0.0px, 0.0px) scale(1.000)'

const i18n = createInstance()
void i18n.init({
  lng: 'en',
  keySeparator: false,
  nsSeparator: false,
  resources: {},
  interpolation: { escapeValue: false }
})

function stat(
  countryCode: string,
  visitors: number
): {
  __typename: 'CampaignCountryStat'
  countryCode: string
  visitors: number
} {
  return { __typename: 'CampaignCountryStat', countryCode, visitors }
}

interface MapOptions {
  highlightedCodes?: string[]
  zoomToHighlighted?: boolean
  visitors?: ReturnType<typeof stat>[]
}

function map(
  shapes: WorldMapShapes,
  {
    highlightedCodes = [],
    zoomToHighlighted = false,
    visitors
  }: MapOptions = {}
): ReactElement {
  return (
    <I18nContext.Provider value={{ i18n }}>
      <WorldMap
        shapes={shapes}
        highlightedCodes={highlightedCodes}
        zoomToHighlighted={zoomToHighlighted}
        visitors={visitors}
        accentColor={accentColor}
        neutralColor={neutralColor}
        locale="en"
      />
    </I18nContext.Provider>
  )
}

function fillOf(testId: string): string {
  return screen.getByTestId(testId).style.fill
}

function transformOf(): string {
  return screen.getByTestId('WorldMapViewport').style.transform
}

describe('buildWorldMap', () => {
  const shapes = buildWorldMap(atlas)

  it('projects every country of the atlas but Antarctica into a path string', () => {
    const ids = shapes.countries.map((country) => country.id)
    expect(shapes.countries).toHaveLength(176)
    expect(ids).not.toContain('010')
    expect(ids).toContain('250')
    expect(shapes.countries.every((country) => country.d.startsWith('M'))).toBe(
      true
    )
    expect(shapes.width).toBe(960)
    expect(shapes.height).toBeGreaterThan(400)
  })

  it('keeps the shapes the atlas leaves unnumbered, without an id', () => {
    const unnumbered = shapes.countries.filter((country) => country.id == null)
    expect(unnumbered.map((country) => country.name).sort()).toEqual([
      'Kosovo',
      'N. Cyprus',
      'Somaliland'
    ])
  })

  it('builds once per atlas', () => {
    expect(buildWorldMap(atlas)).toBe(shapes)
  })

  it('serialises as plain data', () => {
    expect(JSON.parse(JSON.stringify(shapes))).toEqual(shapes)
  })
})

describe('WorldMap', () => {
  const shapes = buildWorldMap(atlas)

  describe('colouring', () => {
    it('shades the highlighted countries in four steps of the accent, lighter with more visitors', () => {
      render(
        map(shapes, {
          highlightedCodes: ['FR', 'DE', 'ES', 'IT'],
          visitors: [
            stat('FR', 100),
            stat('DE', 60),
            stat('ES', 30),
            stat('IT', 10)
          ]
        })
      )
      expect(screen.getByTestId('WorldMapCountry-250')).toHaveAttribute(
        'data-step',
        '3'
      )
      expect(screen.getByTestId('WorldMapCountry-276')).toHaveAttribute(
        'data-step',
        '2'
      )
      expect(screen.getByTestId('WorldMapCountry-724')).toHaveAttribute(
        'data-step',
        '1'
      )
      expect(screen.getByTestId('WorldMapCountry-380')).toHaveAttribute(
        'data-step',
        '0'
      )
      const fills = ['250', '276', '724', '380'].map((id) =>
        fillOf(`WorldMapCountry-${id}`)
      )
      expect(new Set(fills).size).toBe(4)
      expect(fills[0]).toBe(
        screen.getByTestId('WorldMapCountry-250').style.fill
      )
    })

    it('uses the accent itself for the middle step and a lighter one for the top', () => {
      render(
        map(shapes, {
          highlightedCodes: ['FR', 'DE'],
          visitors: [stat('FR', 100), stat('DE', 60)]
        })
      )
      const swatch = document.createElement('div')
      swatch.style.fill = lighten(accentColor, 0.35)
      expect(fillOf('WorldMapCountry-250')).toBe(swatch.style.fill)
      swatch.style.fill = accentColor
      expect(fillOf('WorldMapCountry-276')).toBe(swatch.style.fill)
    })

    it('paints every country outside the highlighted ones in the neutral tint, even with visitors', () => {
      render(
        map(shapes, {
          highlightedCodes: ['FR'],
          visitors: [stat('FR', 100), stat('US', 5000)]
        })
      )
      const swatch = document.createElement('div')
      swatch.style.fill = neutralColor
      expect(fillOf('WorldMapCountry-840')).toBe(swatch.style.fill)
      expect(fillOf('WorldMapCountry-124')).toBe(swatch.style.fill)
      expect(screen.getByTestId('WorldMapCountry-840')).not.toHaveAttribute(
        'data-step'
      )
    })

    it('puts a highlighted country with no visitors on the lowest step', () => {
      render(
        map(shapes, {
          highlightedCodes: ['FR', 'DE'],
          visitors: [stat('FR', 100)]
        })
      )
      expect(screen.getByTestId('WorldMapCountry-276')).toHaveAttribute(
        'data-step',
        '0'
      )
    })

    it('draws the outline alone, with no colour and no tooltips, while the stats load', () => {
      render(map(shapes, { highlightedCodes: ['FR'] }))
      expect(screen.getByTestId('WorldMapCountry-250')).not.toHaveAttribute(
        'data-step'
      )
      expect(screen.getAllByTestId(/^WorldMapCountry-/)).toHaveLength(176)
      fireEvent.mouseOver(screen.getByTestId('WorldMapCountry-250'))
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  describe('joining codes to shapes', () => {
    it('leaves codes without a shape out of the map and never joins on names', () => {
      render(
        map(shapes, {
          highlightedCodes: ['XK', 'SG', 'A1'],
          zoomToHighlighted: true,
          visitors: [stat('XK', 900), stat('SG', 50), stat('A1', 20)]
        })
      )
      expect(screen.getAllByTestId(/^WorldMapCountry-/)).toHaveLength(176)
      expect(screen.queryByTestId('WorldMapCountry-702')).toBeNull()
      expect(screen.getByTestId('WorldMapCountry-Kosovo')).not.toHaveAttribute(
        'data-step'
      )
      expect(transformOf()).toBe(WORLD_TRANSFORM)
    })
  })

  describe('viewport', () => {
    it('shows the whole world for ALL, however many countries are highlighted', () => {
      render(
        map(shapes, {
          highlightedCodes: ['FR', 'DE', 'JP'],
          zoomToHighlighted: false,
          visitors: []
        })
      )
      expect(transformOf()).toBe(WORLD_TRANSFORM)
    })

    it('shows the whole world for a region with no countries', () => {
      render(map(shapes, { zoomToHighlighted: true, visitors: [] }))
      expect(transformOf()).toBe(WORLD_TRANSFORM)
    })

    it("zooms to the bounding box of the region's countries", () => {
      const { rerender } = render(
        map(shapes, {
          highlightedCodes: ['FR', 'DE', 'ES', 'IT'],
          zoomToHighlighted: true,
          visitors: []
        })
      )
      const europe = transformOf()
      expect(europe).not.toBe(WORLD_TRANSFORM)
      const scale = Number(/scale\(([\d.]+)\)/.exec(europe)?.[1])
      expect(scale).toBeGreaterThan(2)

      rerender(
        map(shapes, {
          highlightedCodes: ['FR'],
          zoomToHighlighted: true,
          visitors: []
        })
      )
      const france = transformOf()
      expect(Number(/scale\(([\d.]+)\)/.exec(france)?.[1])).toBeGreaterThan(
        scale
      )

      rerender(
        map(shapes, {
          highlightedCodes: ['FR', 'DE', 'ES', 'IT'],
          zoomToHighlighted: false,
          visitors: []
        })
      )
      expect(transformOf()).toBe(WORLD_TRANSFORM)
    })

    it('keeps the zoomed region inside the view box', () => {
      render(
        map(shapes, {
          highlightedCodes: ['AU'],
          zoomToHighlighted: true,
          visitors: []
        })
      )
      const [x, y, scale] = (
        /translate\((-?[\d.]+)px, (-?[\d.]+)px\) scale\(([\d.]+)\)/.exec(
          transformOf()
        ) ?? []
      )
        .slice(1)
        .map(Number)
      const australia = shapes.countries.find((country) => country.id === '036')
      const [x0, y0, x1, y1] = australia?.bounds ?? [0, 0, 0, 0]
      expect(x + scale * x0).toBeGreaterThanOrEqual(0)
      expect(y + scale * y0).toBeGreaterThanOrEqual(0)
      expect(x + scale * x1).toBeLessThanOrEqual(shapes.width)
      expect(y + scale * y1).toBeLessThanOrEqual(shapes.height)
    })

    it('moves with a CSS transition on the group, not a d3 transition', () => {
      render(map(shapes))
      expect(screen.getByTestId('WorldMapViewport')).toHaveStyle({
        transition: 'transform 600ms ease'
      })
    })
  })

  describe('server rendering', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('renders its path strings without a window', () => {
      vi.stubGlobal('window', undefined)
      const html = renderToString(
        map(shapes, { highlightedCodes: ['FR'], visitors: [stat('FR', 10)] })
      )
      expect(html).toContain('<svg')
      expect(html).toContain(`d="${shapes.countries[0].d}"`)
      expect(html.match(/<path /g)).toHaveLength(176)
    })
  })

  describe('tooltip', () => {
    it('shows the Intl.DisplayNames name and the visitors of a country', async () => {
      render(
        map(shapes, {
          highlightedCodes: ['FR'],
          visitors: [stat('FR', 1234)]
        })
      )
      fireEvent.mouseOver(screen.getByTestId('WorldMapCountry-250'))
      const tooltip = await screen.findByRole('tooltip')
      expect(tooltip).toHaveTextContent('France')
      expect(tooltip).toHaveTextContent('1,234 visitors')
    })

    it('shows a country outside the highlighted ones with its visitors too', async () => {
      render(
        map(shapes, {
          highlightedCodes: ['FR'],
          visitors: [stat('FR', 10), stat('US', 5000)]
        })
      )
      fireEvent.mouseOver(screen.getByTestId('WorldMapCountry-840'))
      const tooltip = await screen.findByRole('tooltip')
      expect(tooltip).toHaveTextContent('United States')
      expect(tooltip).toHaveTextContent('5,000 visitors')
    })

    it('shows 0 visitors for a country with none', async () => {
      render(map(shapes, { visitors: [] }))
      fireEvent.mouseOver(screen.getByTestId('WorldMapCountry-756'))
      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'Switzerland0 visitors'
      )
    })

    it("falls back to the atlas's name for a shape without a code", async () => {
      render(map(shapes, { visitors: [] }))
      fireEvent.mouseOver(screen.getByTestId('WorldMapCountry-Kosovo'))
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Kosovo')
    })
  })
})
