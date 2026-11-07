import { CanvasOrientation } from '@core/journeys/ui/EditorProvider'

import {
  CARD_HEIGHT,
  CARD_WIDTH,
  LAYERED_CARD_CHROME,
  LAYERED_CARD_HORIZONTAL_CHROME,
  calculateLayeredScale,
  getCardDimensions
} from './calculateDimensions'

describe('calculateDimensions', () => {
  describe('getCardDimensions', () => {
    it('should return the portrait frame by default', () => {
      expect(getCardDimensions()).toEqual({
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      })
      expect(getCardDimensions(CanvasOrientation.Portrait)).toEqual({
        width: 324,
        height: 674
      })
    })

    it('should swap the frame for landscape', () => {
      expect(getCardDimensions(CanvasOrientation.Landscape)).toEqual({
        width: 674,
        height: 324
      })
    })
  })

  describe('calculateLayeredScale', () => {
    const originalInnerWidth = window.innerWidth

    function containerRef(clientHeight: number): {
      current: HTMLDivElement
    } {
      const current = document.createElement('div')
      Object.defineProperty(current, 'clientHeight', { value: clientHeight })
      return { current }
    }

    function setWindowWidth(width: number): void {
      Object.defineProperty(window, 'innerWidth', {
        value: width,
        configurable: true,
        writable: true
      })
    }

    afterEach(() => {
      setWindowWidth(originalInnerWidth)
    })

    it('should return 0 when the container is not mounted', () => {
      expect(calculateLayeredScale({ current: null })).toBe(0)
    })

    it('should never scale above 1', () => {
      setWindowWidth(3000)
      expect(calculateLayeredScale(containerRef(3000))).toBe(1)
      expect(
        calculateLayeredScale(containerRef(3000), CanvasOrientation.Landscape)
      ).toBe(1)
    })

    it('should scale a portrait card to the available height', () => {
      setWindowWidth(1440)
      const clientHeight = LAYERED_CARD_CHROME + CARD_HEIGHT / 2

      expect(calculateLayeredScale(containerRef(clientHeight))).toBe(0.5)
    })

    it('should scale a landscape card to the available width', () => {
      const availableWidth = 674 * 0.75
      setWindowWidth(availableWidth + LAYERED_CARD_HORIZONTAL_CHROME)

      expect(
        calculateLayeredScale(containerRef(900), CanvasOrientation.Landscape)
      ).toBe(0.75)
    })

    it('should scale a landscape card to the available height when it runs out first', () => {
      setWindowWidth(3000)
      const clientHeight = LAYERED_CARD_CHROME + 324 / 2

      expect(
        calculateLayeredScale(
          containerRef(clientHeight),
          CanvasOrientation.Landscape
        )
      ).toBe(0.5)
    })

    it('should scale a portrait card to the available width when it runs out first', () => {
      setWindowWidth(LAYERED_CARD_HORIZONTAL_CHROME + 324 / 4)

      expect(calculateLayeredScale(containerRef(3000))).toBe(0.25)
    })
  })
})
