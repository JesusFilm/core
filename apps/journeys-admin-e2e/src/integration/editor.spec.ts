/*
it('should switch to block properties on block click', () => {
    const { getByTestId, getByText, getByRole } = render(
      <ThemeProvider>
        <MockedProvider mocks={[]}>
          <Editor
            journey={{
              __typename: 'Journey',
              id: 'journeyId',
              themeName: ThemeName.base,
              themeMode: ThemeMode.light,
              title: 'my journey',
              slug: 'my-journey',
              description: 'my cool journey',
              blocks: [
                step,
                {
                  id: 'card0.id',
                  __typename: 'CardBlock',
                  parentBlockId: 'step0.id',
                  coverBlockId: null,
                  backgroundColor: null,
                  themeMode: null,
                  themeName: null,
                  fullscreen: false
                },
                {
                  __typename: 'TypographyBlock',
                  id: 'typography0.id',
                  parentBlockId: 'card0.id',
                  content: 'Hello World!',
                  variant: null,
                  color: null,
                  align: null
                },
                {
                  __typename: 'ButtonBlock',
                  id: 'button0.id',
                  parentBlockId: 'card0.id',
                  label: 'This is a button',
                  buttonVariant: null,
                  buttonColor: null,
                  size: null,
                  startIcon: null,
                  endIcon: null,
                  action: null
                },
                {
                  __typename: 'RadioQuestionBlock',
                  id: 'radioQuestion0.id',
                  label: 'Label',
                  description: 'Description',
                  parentBlockId: 'card0.id'
                },
                {
                  __typename: 'RadioOptionBlock',
                  id: 'RadioOption0',
                  label: 'Option 1',
                  parentBlockId: 'radioQuestion0.id',
                  action: null
                },
                {
                  __typename: 'RadioOptionBlock',
                  id: 'RadioOption1',
                  label: 'Option 2',
                  parentBlockId: 'radioQuestion0.id',
                  action: null
                },
                {
                  __typename: 'ImageBlock',
                  id: 'image0.id',
                  src: 'https://images.unsplash.com/photo-1600133153574-25d98a99528c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
                  width: 1600,
                  height: 1067,
                  alt: 'random image from unsplash',
                  parentBlockId: 'card0.id',
                  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
                },
                {
                  __typename: 'VideoBlock',
                  id: 'video0.id',
                  parentBlockId: 'card0.id',
                  autoplay: false,
                  title: 'Video',
                  startAt: 10,
                  endAt: null,
                  muted: null,
                  posterBlockId: 'posterBlockId',
                  videoContent: {
                    __typename: 'VideoArclight',
                    src: 'https://arc.gt/hls/2_0-FallingPlates/529'
                  }
                },
                {
                  __typename: 'SignUpBlock',
                  id: 'signUp0.id',
                  parentBlockId: 'card0.id',
                  submitIcon: null,
                  submitLabel: null,
                  action: null
                }
              ] as TreeBlock[]
            }}
          />
        </MockedProvider>
      </ThemeProvider>
    )

    const CardsTab = getByRole('tab', { name: 'Cards' })
    const PropertiesTab = getByRole('tab', { name: 'Properties' })
    const card = getByTestId('step-step0.id')

    expect(CardsTab).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(getByText('Hello World!'))
    expect(PropertiesTab).toHaveAttribute('aria-selected', 'true')
    expect(
      getByRole('button', { name: 'Font Variant Body 2' })
    ).toBeInTheDocument()
    // expect no drawer opened
    fireEvent.click(card)
    expect(CardsTab).toHaveAttribute('aria-selected', 'true')

    // fireEvent.click(getByRole('button', { name: 'This is a button' }))
    // // expect properties button
    // // expect no drawer opened

    // fireEvent.click(getByTestId(`radioQuestion-${multichoice.id}`))
    // // expect properties button
    // // expect no drawer opened
    // fireEvent.click(getByText('Option 1'))
    // // expect properties button
    // // expect no drawer opened

    // fireEvent.click(getByRole('img'))
    // // expect properties button
    // // expect no drawer opened

    // fireEvent.click(getByTestId('video-video0.id'))
    // // expect properties button
    // // expect no drawer opened

    // fireEvent.click(getByTestId('signUp-signUp0.id'))
    // // expect properties button
    // // expect no drawer opened
  })
 */

describe('fact-or-fiction edit', () => {
  before(() => {
    cy.visit('/journeys/fact-or-fiction/edit')
  })

  const email = 'test@example.com'
  // Test Example
  const password = 'Example1'
  it('should sign in successfully', () => {
    cy.get('button').contains('Sign in with email').click()
    cy.get('input[name=email]').type(email)
    cy.get('button').contains('Next').click()
    cy.get('input[name=password]').type(password)
    cy.get('button').contains('Sign In').click()
  })
  it('should switch to block properties on block click', () => {
    // cy.get('div').contains('Fact or Fiction')
    // cards tab should be selected
    // cy.get('button[tabindex=0]').contains('Cards').should('exist')
    cy.get('button').contains('Cards').should('exist')
    // click on a block

    // properties tab should now be selected
    // cy.get('button')
    //   .contains('Properties')
    //   .should('exist')
    //   .should('be.selected')

    // expect ImageIcon data test id
  })
})
