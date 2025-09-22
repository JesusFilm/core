import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CropWorkspace } from '../components/crop-workspace'
import type { Video, CropKeyframe, DetectionResult, CropBox } from '../types'

// Mock video element
const mockVideoElement = {
  videoWidth: 1920,
  videoHeight: 1080,
  currentTime: 0,
  duration: 60
} as HTMLVideoElement

// Mock props
const mockProps = {
  video: {
    slug: 'test-video',
    title: 'Test Video',
    description: '',
    duration: 60,
    width: 1920,
    height: 1080,
    fps: 29.97,
    src: 'test.mp4',
    poster: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: []
  } as Video,
  bindVideo: jest.fn(),
  currentTime: 10,
  duration: 60,
  onTimeChange: jest.fn(),
  isPlaying: false,
  onTogglePlay: jest.fn(),
  onCreateKeyframe: jest.fn(),
  onToggleAutoTracking: jest.fn(),
  onRunDetection: jest.fn(),
  onPauseDetection: jest.fn(),
  onResumeDetection: jest.fn(),
  autoTrackingEnabled: true,
  crop: {
    x: 0.2,
    y: 0.2,
    width: 0.6,
    height: 0.6
  } as CropBox,
  activeKeyframe: {
    id: 'test-keyframe',
    time: 10,
    window: {
      focusX: 0.5,
      focusY: 0.5,
      scale: 1.0
    }
  } as CropKeyframe,
  onUpdateActiveKeyframe: jest.fn(),
  detections: [] as DetectionResult[],
  detectionStatus: 'complete' as const
}

describe('CropWorkspace Boundary Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should reposition crop window when detection is outside left boundary', async () => {
    const mockOnUpdateKeyframe = jest.fn()
    const detectionOutsideLeft: DetectionResult[] = [
      {
        id: 'detection-1',
        time: 10,
        label: 'face',
        confidence: 0.9,
        box: {
          x: 0.1, // Outside left boundary (crop starts at 0.2)
          y: 0.5,
          width: 0.1,
          height: 0.1
        }
      }
    ]

    render(
      <CropWorkspace
        {...mockProps}
        detections={detectionOutsideLeft}
        onUpdateActiveKeyframe={mockOnUpdateKeyframe}
      />
    )

    // Wait for auto-repositioning effect to run
    await waitFor(() => {
      expect(mockOnUpdateKeyframe).toHaveBeenCalledWith({
        focusX: 0.15, // Center of detection (0.1 + 0.05)
        focusY: 0.55  // Center of detection (0.5 + 0.05)
      })
    })
  })

  it('should reposition crop window when detection is outside right boundary', async () => {
    const mockOnUpdateKeyframe = jest.fn()
    const detectionOutsideRight: DetectionResult[] = [
      {
        id: 'detection-1',
        time: 10,
        label: 'person',
        confidence: 0.85,
        box: {
          x: 0.75, // Outside right boundary (crop ends at 0.8)
          y: 0.5,
          width: 0.1,
          height: 0.1
        }
      }
    ]

    render(
      <CropWorkspace
        {...mockProps}
        detections={detectionOutsideRight}
        onUpdateActiveKeyframe={mockOnUpdateKeyframe}
      />
    )

    await waitFor(() => {
      expect(mockOnUpdateKeyframe).toHaveBeenCalledWith({
        focusX: 0.8, // Center of detection (0.75 + 0.05)
        focusY: 0.55 // Center of detection (0.5 + 0.05)
      })
    })
  })

  it('should reposition crop window when detection is outside top boundary', async () => {
    const mockOnUpdateKeyframe = jest.fn()
    const detectionOutsideTop: DetectionResult[] = [
      {
        id: 'detection-1',
        time: 10,
        label: 'face',
        confidence: 0.95,
        box: {
          x: 0.5,
          y: 0.1, // Outside top boundary (crop starts at 0.2)
          width: 0.1,
          height: 0.1
        }
      }
    ]

    render(
      <CropWorkspace
        {...mockProps}
        detections={detectionOutsideTop}
        onUpdateActiveKeyframe={mockOnUpdateKeyframe}
      />
    )

    await waitFor(() => {
      expect(mockOnUpdateKeyframe).toHaveBeenCalledWith({
        focusX: 0.55, // Center of detection (0.5 + 0.05)
        focusY: 0.15  // Center of detection (0.1 + 0.05)
      })
    })
  })

  it('should reposition crop window when detection is outside bottom boundary', async () => {
    const mockOnUpdateKeyframe = jest.fn()
    const detectionOutsideBottom: DetectionResult[] = [
      {
        id: 'detection-1',
        time: 10,
        label: 'person',
        confidence: 0.88,
        box: {
          x: 0.5,
          y: 0.75, // Outside bottom boundary (crop ends at 0.8)
          width: 0.1,
          height: 0.1
        }
      }
    ]

    render(
      <CropWorkspace
        {...mockProps}
        detections={detectionOutsideBottom}
        onUpdateActiveKeyframe={mockOnUpdateKeyframe}
      />
    )

    await waitFor(() => {
      expect(mockOnUpdateKeyframe).toHaveBeenCalledWith({
        focusX: 0.55, // Center of detection (0.5 + 0.05)
        focusY: 0.8   // Center of detection (0.75 + 0.05)
      })
    })
  })

  it('should not reposition when detection is within crop boundaries', async () => {
    const mockOnUpdateKeyframe = jest.fn()
    const detectionInsideCrop: DetectionResult[] = [
      {
        id: 'detection-1',
        time: 10,
        label: 'face',
        confidence: 0.92,
        box: {
          x: 0.4, // Within crop boundaries (0.2 to 0.8)
          y: 0.4, // Within crop boundaries (0.2 to 0.8)
          width: 0.1,
          height: 0.1
        }
      }
    ]

    render(
      <CropWorkspace
        {...mockProps}
        detections={detectionInsideCrop}
        onUpdateActiveKeyframe={mockOnUpdateKeyframe}
      />
    )

    // Wait a bit to ensure no repositioning occurs
    await waitFor(() => {
      expect(mockOnUpdateKeyframe).not.toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('should prioritize face detection over person detection', async () => {
    const mockOnUpdateKeyframe = jest.fn()
    const mixedDetections: DetectionResult[] = [
      {
        id: 'detection-1',
        time: 10,
        label: 'person',
        confidence: 0.9,
        box: {
          x: 0.3,
          y: 0.3,
          width: 0.1,
          height: 0.1
        }
      },
      {
        id: 'detection-2',
        time: 10,
        label: 'face',
        confidence: 0.85,
        box: {
          x: 0.1, // Outside left boundary - should be prioritized
          y: 0.5,
          width: 0.1,
          height: 0.1
        }
      }
    ]

    render(
      <CropWorkspace
        {...mockProps}
        detections={mixedDetections}
        onUpdateActiveKeyframe={mockOnUpdateKeyframe}
      />
    )

    await waitFor(() => {
      // Should prioritize face detection (higher priority) even though person has higher confidence
      expect(mockOnUpdateKeyframe).toHaveBeenCalledWith({
        focusX: 0.15, // Center of face detection
        focusY: 0.55
      })
    })
  })

  it('should not reposition when auto tracking is disabled', async () => {
    const mockOnUpdateKeyframe = jest.fn()
    const detectionOutsideCrop: DetectionResult[] = [
      {
        id: 'detection-1',
        time: 10,
        label: 'face',
        confidence: 0.9,
        box: {
          x: 0.1, // Outside left boundary
          y: 0.5,
          width: 0.1,
          height: 0.1
        }
      }
    ]

    render(
      <CropWorkspace
        {...mockProps}
        detections={detectionOutsideCrop}
        autoTrackingEnabled={false}
        onUpdateActiveKeyframe={mockOnUpdateKeyframe}
      />
    )

    // Wait to ensure no repositioning occurs
    await waitFor(() => {
      expect(mockOnUpdateKeyframe).not.toHaveBeenCalled()
    }, { timeout: 1000 })
  })
})
