import type VideoJsPlayer from '../videoJsTypes'

/**
 * Hand the player's sources to its source handlers when the Html5 tech
 * skipped them. A `<video>` with `<source>` children that reached the browser
 * before video.js did (a server-rendered page) is already pointed at that
 * source natively, so video.js takes its late-init path and never routes an
 * HLS source through its streaming engine: the player reports the source,
 * the controls show play, and nothing loads. Such an element has no `src`
 * attribute of its own; setting the same sources again goes through the
 * handlers. An element the handlers already fed (a blob or direct `src`) and
 * a non-media tech (YouTube's iframe) are left alone.
 */
/** A source as video.js keeps it; its typings mislabel `currentSources()`. */
interface PlayerSource {
  src: string
  type?: string
}

export function reapplyUnhandledSource(player: VideoJsPlayer): void {
  const sources = player.currentSources() as unknown as PlayerSource[]
  if (sources.length === 0) return
  const el = player.tech({ IWillNotUseThisInPlugins: true })?.el()
  if (!(el instanceof HTMLMediaElement) || el.getAttribute('src') != null)
    return
  player.src(sources as never)
}
