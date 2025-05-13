// import { generateImage } from './generateImage'
import { clientRedirectUserToEditor } from './redirectUserToEditor'
import { clientSelectImage } from './selectImage'
import { clientSelectVideo } from './selectVideo'

export const tools = {
  clientSelectImage,
  clientSelectVideo,
  // TODO: Uncomment this when we have solved image upload issues
  // generateImage,
  clientRedirectUserToEditor
}
