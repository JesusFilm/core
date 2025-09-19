'use client'

import { useEffect, useState } from 'react'
import type { DetectionResult } from '../types'

interface DebugWidgetProps {
  detectionStatus: 'idle' | 'running' | 'complete'
  detections: DetectionResult[]
  autoTrackingEnabled?: boolean
  isVisible?: boolean
}

export function DebugWidget({ detectionStatus, detections, autoTrackingEnabled = false, isVisible = true }: DebugWidgetProps) {
  const [mediapipeStatus, setMediapipeStatus] = useState<'unknown' | 'initialized' | 'failed'>('unknown')
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    // Listen for detection debug events
    const handleDebugEvent = (event: CustomEvent) => {
      const message = event.detail
      if (message.mediapipeInitialized) {
        setMediapipeStatus('initialized')
      } else if (message.mediapipeFailed) {
        setMediapipeStatus('failed')
        setLastError('MediaPipe initialization failed')
      }
    }

    // Add event listener for debug events
    window.addEventListener('detection-debug', handleDebugEvent as EventListener)

    return () => {
      window.removeEventListener('detection-debug', handleDebugEvent as EventListener)
    }
  }, [])

  const mediapipeDetections = detections.filter(d => d.source === 'mediapipe')
  const mockDetections = detections.filter(d => d.source === 'mock')

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white text-xs font-mono p-3 rounded-lg border border-gray-600 max-w-xs z-50">
      <div className="font-bold text-cyan-400 mb-2">🔍 T032 Debug</div>
      <div className="text-gray-400 text-xs mb-2 opacity-75">
        MediaPipe Tasks Vision status
      </div>
      <div className="text-gray-500 text-xs mb-2 opacity-60">
        Shows real status when "Run auto tracking" is clicked
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>MediaPipe:</span>
          <span className={
            mediapipeStatus === 'initialized' ? 'text-green-400' :
            mediapipeStatus === 'failed' ? 'text-red-400' :
            'text-yellow-400'
          }>
            {mediapipeStatus === 'initialized' ? '✅ Active' :
             mediapipeStatus === 'failed' ? '❌ Failed' :
             '⏳ Unknown'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Detection:</span>
          <span className={
            detectionStatus === 'running' ? 'text-blue-400' :
            detectionStatus === 'complete' ? 'text-green-400' :
            'text-gray-400'
          }>
            {detectionStatus}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Auto Tracking:</span>
          <span className={autoTrackingEnabled ? 'text-cyan-400' : 'text-gray-400'}>
            {autoTrackingEnabled ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Total Detections:</span>
          <span>{detections.length}</span>
        </div>

        <div className="flex justify-between">
          <span>MediaPipe:</span>
          <span className="text-green-400">{mediapipeDetections.length}</span>
        </div>

        <div className="flex justify-between">
          <span>Mock:</span>
          <span className="text-yellow-400">{mockDetections.length}</span>
        </div>

        {lastError && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-red-400 text-xs">MediaPipe Error:</div>
            <div className="text-red-300 text-xs truncate">{lastError}</div>
          </div>
        )}

        {!lastError && mediapipeStatus === 'unknown' && (
          <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400 text-xs">
            💡 Status shows when detection runs. Use "Test Events" to verify communication.
          </div>
        )}

        {mediapipeStatus !== 'unknown' && !lastError && (
          <div className="mt-2 pt-2 border-t border-gray-600 text-green-400 text-xs">
            ✅ Event communication working!
          </div>
        )}

        {mediapipeStatus === 'initialized' && mediapipeDetections.length === 0 && detectionStatus === 'complete' && (
          <div className="mt-2 pt-2 border-t border-gray-600 text-yellow-400 text-xs">
            ⚠️ MediaPipe active but no detections found. Check video content.
          </div>
        )}

        {mediapipeStatus === 'failed' && detectionStatus === 'idle' && (
          <div className="mt-2 pt-2 border-t border-gray-600 text-yellow-400 text-xs">
            ⚠️ MediaPipe failed to load. Will use mock data when detection runs.
          </div>
        )}

        {mediapipeStatus === 'failed' && (detectionStatus === 'running' || detectionStatus === 'complete') && (
          <div className="mt-2 pt-2 border-t border-gray-600 text-yellow-400 text-xs">
            ⚠️ Using mock data as fallback.
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-gray-600 flex gap-1">
          <button
            className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white"
            onClick={() => {
              // Test if custom events are working - sends random test results
              const testResult = Math.random() > 0.5
              window.dispatchEvent(new CustomEvent('detection-debug', {
                detail: testResult ? { mediapipeInitialized: true } : { mediapipeFailed: true }
              }))
              console.log('🔍 Debug Widget: Test event sent (random)', testResult ? 'initialized' : 'failed')
            }}
            title="Sends random test events to verify widget communication"
          >
            Test Events
          </button>
          <button
            className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-white"
            onClick={() => {
              setMediapipeStatus('unknown')
              setLastError(null)
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
