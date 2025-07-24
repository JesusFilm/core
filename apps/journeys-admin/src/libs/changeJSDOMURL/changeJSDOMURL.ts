export function changeJSDOMURL(url) {
  const newURL = new URL(url)
  const href = `${window.origin}${newURL.pathname}${newURL.search}${newURL.hash}`
  history.replaceState(history.state, '', href)
}
