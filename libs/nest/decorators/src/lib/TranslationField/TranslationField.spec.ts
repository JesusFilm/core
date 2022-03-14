import type { Translation } from './TranslationField'
import { TranslationField } from '.'

describe('TranslationField', () => {
  describe('when array of translations', () => {
    const parent = {
      name: [
        {
          value: '普通話',
          primary: true,
          languageId: '20615'
        },
        {
          value: 'Chinese, Mandarin',
          primary: false,
          languageId: '529'
        }
      ]
    }

    class Translatable {
      @TranslationField('name')
      name(
        _parent: { name: Translation[] },
        _languageId?: string,
        _primary?: boolean
      ): void {}
    }

    it('should return translations', () => {
      expect(new Translatable().name(parent)).toEqual(parent.name)
    })

    it('should return translations filtered by languageId', () => {
      expect(new Translatable().name(parent, '529')).toEqual([parent.name[1]])
    })

    it('should return translations filtered by primary', () => {
      expect(new Translatable().name(parent, undefined, true)).toEqual([
        parent.name[0]
      ])
    })

    it('should return tranlsations filtered by languageId or primary', () => {
      expect(new Translatable().name(parent, '529', true)).toEqual(parent.name)
    })
  })

  describe('when array of array of translations', () => {
    const parent = {
      studyQuestions: [
        [
          {
            value: '普通話',
            primary: true,
            languageId: '20615'
          },
          {
            value: 'Chinese, Mandarin',
            primary: false,
            languageId: '529'
          }
        ]
      ]
    }

    class Translatable {
      @TranslationField('studyQuestions')
      studyQuestions(
        _parent: { studyQuestions: Translation[][] },
        _languageId?: string,
        _primary?: boolean
      ): void {}
    }

    it('should return array of translations', () => {
      expect(new Translatable().studyQuestions(parent)).toEqual(
        parent.studyQuestions
      )
    })

    it('should return array of translations filtered by languageId', () => {
      expect(new Translatable().studyQuestions(parent, '529')).toEqual([
        [parent.studyQuestions[0][1]]
      ])
    })

    it('should return array of translations filtered by primary', () => {
      expect(
        new Translatable().studyQuestions(parent, undefined, true)
      ).toEqual([[parent.studyQuestions[0][0]]])
    })

    it('should return array of tranlsations filtered by languageId or primary', () => {
      expect(new Translatable().studyQuestions(parent, '529', true)).toEqual(
        parent.studyQuestions
      )
    })
  })
})
