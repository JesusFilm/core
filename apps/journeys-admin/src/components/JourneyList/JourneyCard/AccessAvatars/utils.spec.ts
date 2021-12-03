import { createToolTipTitle, createFallbackLetter, orderAvatars } from './utils'
import { user1, user2, user3 } from './AccessAvatarsData'

describe('utils', () => {
  describe('createToolTipTitle', () => {
    it('should return first name and last', () => {
      const user = user1
      const expected = createToolTipTitle(user)
      const answer = 'Amin Person'
      expect(expected).toEqual(answer)
    })
    it('should return email', () => {
      const user = { ...user1, firstName: undefined }
      const expected = createToolTipTitle(user)
      const answer = user1.email
      expect(expected).toEqual(answer)
    })
    it('should return Anonymous', () => {
      const user = { ...user1, firstName: undefined, email: undefined }
      const expected = createToolTipTitle(user)
      const answer = 'Anonymous'
      expect(expected).toEqual(answer)
    })
  })

  describe('createFallbackLetter', () => {
    it('should return first letter for first name capitalized', () => {
      const user = user1
      const expected = createFallbackLetter(user)
      const answer = 'A'

      expect(expected).toEqual(answer)
    })
    it('should return first letter for email capitalized', () => {
      const user = { ...user1, firstName: undefined }
      const expected = createFallbackLetter(user)
      const answer = 'A'
      expect(expected).toEqual(answer)
    })
    it('should return null if no first name or last name', () => {
      const user = { ...user1, firstName: undefined, email: undefined }
      const expected = createFallbackLetter(user)

      expect(expected).toBeNull()
    })
  })

  describe('orderAvatars', () => {
    it('should return the avatars ordered by role', () => {
      const unordered = [user1, user2, user3]
      const ordered = [user3, user2, user1]
      expect(orderAvatars(unordered)).toEqual(ordered)
    })
  })
})
