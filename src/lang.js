import en from '../locales/en.js'

const LANGUAGES = {en}

const DEFAULT_LANGUAGE = 'en'

export function getTranslation(lang=DEFAULT_LANGUAGE) {
    return function translate(key, options={}) {
        let string = LANGUAGES[lang][key] || LANGUAGES[DEFAULT_LANGUAGE][key]
        for(const [key, values] of Object.entries(options)) {
            string = string.replace(`%${key}%`, values)
        }
        return string
    }
}
