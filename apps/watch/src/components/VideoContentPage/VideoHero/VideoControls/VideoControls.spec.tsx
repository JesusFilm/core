// import { act, cleanup, fireEvent, render } from '@testing-library/react'
// import videojs from 'video.js'
// import {
//   VideoContentFields,
//   VideoContentFields_children
// } from '../../../../../__generated__/VideoContentFields'
// import { VideoProvider } from '../../../../libs/videoContext'
// import { VideoControls } from './VideoControls'

// describe('VideoControls', () => {
//   const setFullscreen = jest.fn()

//   const video = {
//     id: '2_video-0-0',
//     image:
//       'https://images.unsplash.com/photo-1670140274562-2496ccaa5271?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
//     title: [{ value: 'video title' }],
//     description: [
//       {
//         value: 'video description'
//       }
//     ],
//     variant: {
//       hls: '',
//       duration: 100,
//       slug: '2_video-0-0/english'
//     },
//     children: [{ id: 'child.id' } as unknown as VideoContentFields_children]
//   } as unknown as VideoContentFields

//   let player
//   beforeEach(() => {
//     const video = document.createElement('video')
//     document.body.appendChild(video)
//     player = videojs(video, {
//       autoplay: false,
//       controls: true,
//       userActions: {
//         hotkeys: true,
//         doubleClick: true
//       },
//       controlBar: {
//         playToggle: true,
//         remainingTimeDisplay: true,
//         progressControl: {
//           seekBar: true
//         },
//         fullscreenToggle: true,
//         volumePanel: {
//           inline: false
//         }
//       },
//       responsive: true
//     })
//   })
//   afterEach(() => {
//     cleanup()
//   })

//   it('plays the video', () => {
//     const playStub = jest
//       .spyOn(window.HTMLMediaElement.prototype, 'play')
//       .mockImplementation({})
//     const { getByTestId } = render(
//       <VideoProvider value={{ content: video }}>
//         <VideoControls
//           player={player}
//           fullscreen={false}
//           setFullscreen={setFullscreen}
//         />
//       </VideoProvider>
//     )
//     fireEvent.click(getByTestId('PlayArrowRoundedIcon'))
//     expect(playStub).toHaveBeenCalled()
//     expect(getByTestId('PauseRoundedIcon')).toBeInTheDocument()
//   })

//   it('shows the progress bar', () => {
//     const { getByTestId } = render(
//       <VideoControls
//         player={player}
//         fullscreen={false}
//         setFullscreen={setFullscreen}
//       />
//     )
//   })

//   it('shows the duration of the movie', () => {
//     const { getByTestId } = render(
//       <VideoControls
//         player={player}
//         fullscreen={false}
//         setFullscreen={setFullscreen}
//       />
//     )
//   })

//   it('shows the volume control', () => {
//     const { getByTestId } = render(
//       <VideoControls
//         player={player}
//         fullscreen={false}
//         setFullscreen={setFullscreen}
//       />
//     )
//     fireEvent.click(getByTestId('VolumeOffOutlinedIcon'))
//     expect(getByTestId('VolumeUpOutlinedIcon')).toBeInTheDocument()
//   })

//   it('goes on fullscreen click', () => {
//     const { getByTestId } = render(
//       <VideoControls
//         player={player}
//         fullscreen={false}
//         setFullscreen={setFullscreen}
//       />
//     )
//   })

//   //TODO: add test on Language and Subtitle Dialog click
// })
