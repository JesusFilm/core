import { expect, type Locator } from '@playwright/test'

export async function assertPlaybackProgress(
  video: Locator,
  timeout = 30000
): Promise<void> {
  await expect(video).toHaveCount(1, { timeout })
  await video.evaluate((element: HTMLVideoElement) => {
    element.muted = true
    // Playback can stay pending indefinitely when no media source is available.
    // The bounded poll below reports both rejected playback and stalled media.
    void element.play().catch(() => {})
  })
  const initialTime = await video.evaluate(
    (element: HTMLVideoElement) => element.currentTime
  )

  await expect
    .poll(
      async () =>
        await video.evaluate(
          (element: HTMLVideoElement, startedAt: number) => ({
            hasMediaData:
              element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA,
            hasNoMediaError: element.error === null,
            isPlaying: !element.paused,
            hasAdvanced: element.currentTime > startedAt + 1
          }),
          initialTime
        ),
      { timeout, message: 'Video must play and advance by at least one second' }
    )
    .toEqual({
      hasMediaData: true,
      hasNoMediaError: true,
      isPlaying: true,
      hasAdvanced: true
    })
}
