export const getWebEmbedPlayer = (
  variantId: string,
  apiSessionId: string
): string => {
  return cleanString(`
    <div class="arc-cont">
      <iframe src="https://api.arclight.org/videoPlayerUrl?refId=${variantId}&apiSessionId=${apiSessionId}&player=bc.vanilla6&dtm=0&playerStyle=vanilla" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe>
      <style>
        .arc-cont {
          position: relative;
          display: block;
          margin: 10px auto;
          width: 100%;
        }
        .arc-cont:after {
          padding-top: 59%;
          display: block;
          content: "";
        }
        .arc-cont > iframe {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          left: 0;
          width: 98%;
          height: 98%;
          border: 0;
        }
      </style>
    </div>`)
}

export const getWebEmbedSharePlayer = (
  variantId: string,
  apiSessionId: string
): string => {
  return cleanString(`
      <div class="arc-cont">
        <iframe src="https://api.arclight.org/videoPlayerUrl?refId=${variantId}&apiSessionId=${apiSessionId}&player=bc.vanilla6&dtm=0&playerStyle=default" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe>
        <style>
          .arc-cont {
            position: relative;
            display: block;
            margin: 10px auto;
            width: 100%;
          }
          .arc-cont:after {
            padding-top: 59%;
            display: block;
            content: "";
          }
          .arc-cont > iframe {
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            width: 98%;
            height: 98%;
            border: 0;
          }
        </style>
      </div>`)
}
const cleanString = (str: string): string => str.replace(/\s+/g, ' ').trim()
