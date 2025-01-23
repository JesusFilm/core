import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../lib/apolloClient'

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoVariant($id: ID!) {
    videoVariants(input: { id: $id }) {
      id
      hls
    }
  }
`)

export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams
  const refId = searchParams.get('refId')
  const autoPlay = searchParams.get('autoPlay') === 'true'
  const showSocial = searchParams.get('showSocial') === 'true'
  const isSecure = searchParams.get('isSecure') === 'true'
  const width = searchParams.get('width') ?? '640'
  const height = searchParams.get('height') ?? '360'

  if (refId == null) {
    return new Response('Variant ID is required', { status: 400 })
  }

  try {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_VIDEO_VARIANT>
    >({
      query: GET_VIDEO_VARIANT,
      variables: { id: refId }
    })

    const hlsUrl = data?.videoVariants?.[0]?.hls
    if (hlsUrl == null) {
      return new Response('Video not found', { status: 404 })
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Video Player</title>
          <script src="https://${isSecure ? 'secure.' : ''}cdn.jsdelivr.net/npm/hls.js@latest"></script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              background: #FFFFFF;
              min-height: 100vh;
            }
            .video-container {
              width: 100%;
              margin: ${showSocial ? '-24px 0 0 -11px' : '0'};
            }
            video {
              width: ${width}px;
              height: ${height}px;
              background: #FFFFFF;
            }
            .loading {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: black;
              font-family: system-ui;
            }
            @media screen {
              .video-container.in-iframe video {
                width: calc(100vw ${showSocial ? '' : '- 20px'});
                height: calc(100vh - ${showSocial ? '5px' : '50px'});
              }
            }
          </style>
        </head>
        <body>
          <div id="container" class="video-container">
            <video id="video" controls ${autoPlay ? 'autoplay' : ''} playsinline></video>
            <div id="loading" class="loading">Loading...</div>
          </div>
          <script>
            const video = document.getElementById('video');
            const container = document.getElementById('container');
            const loading = document.getElementById('loading');
            const hlsUrl = '${hlsUrl}';
            
            function hideLoading() {
              loading.style.display = 'none';
            }

            function showError(message) {
              loading.textContent = message;
            }

            // Handle iframe resizing
            if (window.top !== window.self) {
              container.classList.add('in-iframe');
            }

            if (Hls.isSupported()) {
              const hls = new Hls({ 
                enableWorker: true,
                lowLatencyMode: true
              });

              hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                  showError('Error loading video');
                  console.error('HLS Error:', data);
                }
              });

              hls.on(Hls.Events.MANIFEST_PARSED, hideLoading);

              hls.loadSource(hlsUrl);
              hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = hlsUrl;
              video.addEventListener('loadedmetadata', hideLoading);
              video.addEventListener('error', () => showError('Error loading video'));
            } else {
              showError('Your browser does not support HLS video playback');
            }
          </script>
        </body>
      </html>
    `

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    console.error('Error fetching video:', error)
    return new Response('Error loading video', { status: 500 })
  }
}
