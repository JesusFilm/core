import { toAiChatSettings, toCardBlockAiChatInput } from './aiChatSettings'

describe('aiChatSettings mapper', () => {
  describe('toAiChatSettings (back-end → front-end)', () => {
    it('maps showAssistant true to enableAiChat true', () => {
      expect(toAiChatSettings({ showAssistant: true }).enableAiChat).toBe(true)
    })

    it('maps showAssistant null/false to enableAiChat false', () => {
      expect(toAiChatSettings({ showAssistant: null }).enableAiChat).toBe(false)
      expect(toAiChatSettings({ showAssistant: false }).enableAiChat).toBe(
        false
      )
    })

    it('treats expandChatByDefault === false as collapseChat true', () => {
      expect(
        toAiChatSettings({ expandChatByDefault: false }).collapseChat
      ).toBe(true)
    })

    it('treats expandChatByDefault true/null/undefined as collapseChat false (pop open)', () => {
      expect(toAiChatSettings({ expandChatByDefault: true }).collapseChat).toBe(
        false
      )
      expect(toAiChatSettings({ expandChatByDefault: null }).collapseChat).toBe(
        false
      )
      expect(toAiChatSettings({}).collapseChat).toBe(false)
    })
  })

  describe('toCardBlockAiChatInput (front-end → back-end)', () => {
    it('maps enableAiChat directly to showAssistant', () => {
      expect(
        toCardBlockAiChatInput({ enableAiChat: true, collapseChat: false })
          .showAssistant
      ).toBe(true)
      expect(
        toCardBlockAiChatInput({ enableAiChat: false, collapseChat: false })
          .showAssistant
      ).toBe(false)
    })

    it('inverts collapseChat into expandChatByDefault', () => {
      expect(
        toCardBlockAiChatInput({ enableAiChat: true, collapseChat: false })
          .expandChatByDefault
      ).toBe(true)
      expect(
        toCardBlockAiChatInput({ enableAiChat: true, collapseChat: true })
          .expandChatByDefault
      ).toBe(false)
    })
  })

  describe('round trip', () => {
    it('preserves an explicit collapse choice', () => {
      const settings = { enableAiChat: true, collapseChat: true }
      expect(toAiChatSettings(toCardBlockAiChatInput(settings))).toEqual(
        settings
      )
    })

    it('preserves a popped-open choice', () => {
      const settings = { enableAiChat: true, collapseChat: false }
      expect(toAiChatSettings(toCardBlockAiChatInput(settings))).toEqual(
        settings
      )
    })

    it('reads a legacy null card as enabled + popped open (zero-migration default flip)', () => {
      expect(
        toAiChatSettings({ showAssistant: true, expandChatByDefault: null })
      ).toEqual({ enableAiChat: true, collapseChat: false })
    })
  })
})
