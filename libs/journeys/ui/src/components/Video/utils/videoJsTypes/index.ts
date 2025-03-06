import Player from 'video.js/dist/types/player'

import { Html5 } from './Html5'
import { QualityLevelList } from './QualityLevelList'
import { YoutubeTech } from './YoutubeTech'

// We're manually extending the player types because added
// types from plugins weren't being applied correctly

export default interface VideoJsPlayer extends Player {
  qualityLevels(): QualityLevelList
  tech(options: { IWillNotUseThisInPlugins: true }): Html5 | YoutubeTech
}
