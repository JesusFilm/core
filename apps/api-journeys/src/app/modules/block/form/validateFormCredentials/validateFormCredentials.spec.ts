/* eslint-disable jest/expect-expect */

describe('validateFormCredentials', () => {
  it('throws error if trying to update projectId and or formSlug with no apiToken', () => {
    // input: {token: null, id: val, slug: val}
    // block: {token: null, id: null, slug: null}
  })

  it('throws error if trying to update formSlug with no projectId', () => {
    // input {token: val, id: null, slug: val}
    // block {token: val, id: null, slug: null}
  })

  describe('apiToken', () => {
    it('validates apiToken input', () => {
      // input {token: val, id: null, slug: null}
    })

    it('update apiToken and clears projectId and formSlug', () => {
      // input {token: val, id: null, slug: null}
      // block {token: val, id: val, slug: val}
    })

    it('clears apiToken if there is a input and it is null', () => {
      // input {token: "", id: null, slug: null}
      // block {token: val, id: val, slug: val}
    })
  })

  describe('projectId', () => {
    it('validates apiToken and projectId inputs', () => {
      // input {token: null, id: val, slug: null}
      // block {token: val, id: null, slug: null}
      //
      // input {token: val, id: val, slug: null}
      // block {token: null, id: null, slug: null}
    })

    it('updates projectId and clears formSlug', () => {
      // input {token: null, id: val, slug: null}
      // block {token: val, id: val, slug: val}
    })

    it('updates apiToken and projectId', () => {
      // input {token: val, id: val, slug: null}
      // block {token: null, id: null, slug: null}
    })

    it('validates apiToken when clearing the projectId and apiToken is in the input', () => {
      // input {token: val, id: "", slug: null}
      // block {token: val, id: val, slug: null}
    })

    it('should not validate apiToken when clearing the projectId and apiToken is in the block', () => {
      // input {token: null, id: "", slug: null}
      // block {token: val, id: val, slug: null}
    })

    it('clears the projectId and formSlug', () => {
      // input {token: null, id: "", slug: null}
      // block {token: val, id: val, slug: null}
    })
  })

  describe('formSlug', () => {
    it('validates apiToken, projectId and formSlug inputs', () => {
      // input {token: null, id: null, slug: val}
      // block {token: val, id: val, slug: val}
      //
      // input {token: null, id: val, slug: val}
      // block {token: val, id: val, slug: val}
      //
      // input {token: val, id: val, slug: val}
      // block {token: val, id: val, slug: val}
    })

    it('updates fromSlug', () => {
      // input {token: null, id: null, slug: val}
      // block {token: val, id: val, slug: val}
    })

    it('updates apiToken, projectId and formSlug', () => {
      // input {token: val, id: val, slug: val}
      // block {token: null, id: null, slug: null}
    })

    it('validates apiToken and projectId when clearing the slug and apiToken and/or projectId is in the input', () => {
      // input {token: null, id: val, slug: ""}
      // block {token: val, id: val, slug: val}
      //
      // input {token: val, id: val, slug: ""}
      // block {token: val, id: val, slug: val}
    })

    it('should not validate apiToken and projectId when clearing the slug and both, apiToken and projectId is not in the input', () => {
      // input {token: null, id: null, slug: ""}
      // block {token: val, id: val, slug: val}
    })

    it('clears formSlug', () => {
      // input {token: null, id: null, slug: ""}
      // block {token: val, id: val, slug: val}
    })
  })

  it('throws general error if validation fails', () => {
    // input {token: null, id: null, slug: null}
  })
})
