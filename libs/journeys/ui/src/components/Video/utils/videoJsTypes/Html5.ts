import Tech from 'video.js/dist/types/tech/tech'

// From `videojs-http-streaming`
// included in videoJs 7+ by default, no types given :(
// extend based of docs as needed
// https://www.npmjs.com/package/@videojs/http-streaming

export interface Html5 extends Tech {
  vhs: {
    playlistController_?: {
      fastQualityChange_?: () => void
    }
    mediaSource?: MediaSource
    stats?: {
      bandwidth?: number
      streamBitrate?: number
      mediaBytesTransferred?: number
      mediaRequests?: number
      mediaRequestsAborted?: number
      mediaTransferDuration?: number
    }
    bandwidth?: number
    streamBitrate?: number
  }
}
