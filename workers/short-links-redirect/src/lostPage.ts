/**
 * The "lost page" 404 (same copy as
 * `apps/short-links/src/app/[hostname]/[...pathname]/not-found.tsx`).
 * Plain HTML with inline CSS so the hot path never fetches an asset.
 */
export const LOST_PAGE_TITLE = "We've Lost This Page"

export const LOST_PAGE_DESCRIPTION =
  "Sorry, the page you are looking for doesn't exist or has been moved."

export const LOST_PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Not Found</title>
<meta name="description" content="${LOST_PAGE_DESCRIPTION}">
<style>
html,body{margin:0;min-height:100vh;font-family:Roboto,Helvetica,Arial,sans-serif;color:rgba(0,0,0,.87);background:#fff}
main{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px;text-align:center;box-sizing:border-box}
h1{margin:0 0 16px;font-size:2.125rem;font-weight:400;line-height:1.235}
h2{margin:0;font-size:1.5rem;font-weight:400;line-height:1.334}
</style>
</head>
<body>
<main>
<h1>${LOST_PAGE_TITLE}</h1>
<h2>${LOST_PAGE_DESCRIPTION}</h2>
</main>
</body>
</html>
`

export function lostPageResponse(): Response {
  return new Response(LOST_PAGE_HTML, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}
