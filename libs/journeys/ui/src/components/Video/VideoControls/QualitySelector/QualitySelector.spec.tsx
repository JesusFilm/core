import { fireEvent, render, screen } from '@testing-library/react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'videojs-contrib-quality-levels'

import { QualitySelector } from './QualitySelector'
import { QualityLevel, QualityLevelList } from './types'

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('QualitySelector', () => {
  let player: Player

  beforeEach(() => {
    const videoEl = document.createElement('video')
    player = videojs(videoEl)

    // Mock quality levels
    const mockQualityLevels: Partial<QualityLevelList> = {
      length: 3,
      selectedIndex: 0,
      [0]: {
        id: '1080p',
        width: 1920,
        height: 1080,
        bitrate: 5000000,
        enabled: true
      } as QualityLevel,
      [1]: {
        id: '720p',
        width: 1280,
        height: 720,
        bitrate: 2500000,
        enabled: true
      } as QualityLevel,
      [2]: {
        id: '480p',
        width: 854,
        height: 480,
        bitrate: 1000000,
        enabled: true
      } as QualityLevel,
      on: jest.fn(),
      off: jest.fn()
    }
    ;(
      player as unknown as { qualityLevels: () => QualityLevelList }
    ).qualityLevels = jest
      .fn()
      .mockReturnValue(mockQualityLevels as QualityLevelList)
  })

  afterEach(() => {
    player.dispose()
  })

  it('should render quality button', () => {
    render(<QualitySelector player={player} isMobile={false} />)
    expect(screen.getByLabelText('quality-settings')).toBeInTheDocument()
  })

  describe('desktop', () => {
    it('should open menu on click', () => {
      render(<QualitySelector player={player} isMobile={false} />)
      fireEvent.click(screen.getByLabelText('quality-settings'))
      expect(screen.getByText('Auto')).toBeInTheDocument()
      expect(screen.getByText('1080p')).toBeInTheDocument()
      expect(screen.getByText('720p')).toBeInTheDocument()
      expect(screen.getByText('480p')).toBeInTheDocument()
    })

    it('should show check icon for auto mode', () => {
      render(<QualitySelector player={player} isMobile={false} />)
      fireEvent.click(screen.getByLabelText('quality-settings'))
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems[0]).toHaveTextContent('Auto')
      expect(menuItems[0].querySelector('svg')).toBeInTheDocument() // Check icon
    })

    it('should change quality on selection', () => {
      render(<QualitySelector player={player} isMobile={false} />)
      fireEvent.click(screen.getByLabelText('quality-settings'))
      fireEvent.click(screen.getByText('720p'))

      const qualityLevels = (
        player as unknown as { qualityLevels: () => QualityLevelList }
      ).qualityLevels()
      expect(qualityLevels[0].enabled).toBe(false)
      expect(qualityLevels[1].enabled).toBe(true) // 720p enabled
      expect(qualityLevels[2].enabled).toBe(false)
    })
  })

  describe('mobile', () => {
    it('should open modal on click', () => {
      render(<QualitySelector player={player} isMobile />)
      fireEvent.click(screen.getByLabelText('quality-settings'))
      expect(screen.getByText('Quality')).toBeInTheDocument()
      expect(screen.getByText('Auto')).toBeInTheDocument()
    })

    it('should close modal on selection', () => {
      render(<QualitySelector player={player} isMobile />)
      fireEvent.click(screen.getByLabelText('quality-settings'))
      fireEvent.click(screen.getByText('720p'))
      expect(screen.queryByText('Quality')).not.toBeInTheDocument()
    })
  })

  describe('quality level changes', () => {
    it('should update quality options when levels change', () => {
      const { rerender } = render(
        <QualitySelector player={player} isMobile={false} />
      )

      // Simulate new quality level added
      const newQualityLevels: Partial<QualityLevelList> = {
        ...(
          player as unknown as { qualityLevels: () => QualityLevelList }
        ).qualityLevels(),
        length: 4,
        [3]: {
          id: '360p',
          width: 640,
          height: 360,
          bitrate: 600000,
          enabled: true
        } as QualityLevel
      }
      ;(
        player as unknown as { qualityLevels: () => QualityLevelList }
      ).qualityLevels = jest
        .fn()
        .mockReturnValue(newQualityLevels as QualityLevelList)

      rerender(<QualitySelector player={player} isMobile={false} />)
      fireEvent.click(screen.getByLabelText('quality-settings'))
      expect(screen.getByText('360p')).toBeInTheDocument()
    })

    it('should show current auto-selected quality', () => {
      const { rerender } = render(
        <QualitySelector player={player} isMobile={false} />
      )

      // Simulate auto quality change
      const updatedQualityLevels: Partial<QualityLevelList> = {
        ...(
          player as unknown as { qualityLevels: () => QualityLevelList }
        ).qualityLevels(),
        selectedIndex: 1 // 720p selected
      }
      ;(
        player as unknown as { qualityLevels: () => QualityLevelList }
      ).qualityLevels = jest
        .fn()
        .mockReturnValue(updatedQualityLevels as QualityLevelList)

      rerender(<QualitySelector player={player} isMobile={false} />)
      fireEvent.click(screen.getByLabelText('quality-settings'))
      expect(screen.getByText('Auto (720p)')).toBeInTheDocument()
    })
  })
})
