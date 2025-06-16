'use client'

import styled from '@emotion/styled'

const StyledPage = styled.div`
  .page {
  }
`

export default function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.@emotion/styled file.
   */
  return (
    <StyledPage>
      <div className="wrapper">
        <div className="container">
          <div id="welcome">
            <h1>
              <span> Hello there, </span>
              Welcome watch-modern 👋
            </h1>
          </div>
        </div>
      </div>
    </StyledPage>
  )
}
