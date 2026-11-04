import { expect, test } from '@playwright/test'

import { getKeywordPageText } from '../monitoring/watch-keyword-content'

test('reads decoded body content across inline elements', () => {
  const text = getKeywordPageText('<html><body><p>7 Days <strong>With Jesus</strong> &amp; John 14</p></body></html>')
  expect(text).toContain('7 days with jesus & john 14')
})

test('excludes keywords present only in metadata or inert markup', () => {
  const text = getKeywordPageText(`<html><head><title>LUMO</title></head><body>
    <script>{"title":"LUMO"}</script><style>.LUMO { color: red }</style>
    <template>LUMO</template><noscript>LUMO</noscript><!-- LUMO -->
    <p>Other content</p></body></html>`)
  expect(text).not.toContain('lumo')
  expect(text).toContain('other content')
})

test('rejects non-page responses without an HTML body', () => {
  expect(() => getKeywordPageText('<error>LUMO</error>')).toThrow('Expected an HTML document with a body')
})

test('includes server-rendered React stream chunks', () => {
  const text = getKeywordPageText('<html><body><div hidden="hidden" id="S:1">John 14</div></body></html>')
  expect(text).toContain('john 14')
})
