import i18next from 'i18next'
import { getI18n, initReactI18next } from 'react-i18next'
import enUS from './en-us.json'
import zhCN from './zh-cn.json'
import zhTW from './zh-tw.json'
import jaJP from './ja-jp.json'

export const resources = {
	'zh-CN': {
		...zhCN,
	},
	'zh-TW': {
		...zhTW,
	},
	'en-US': {
		...enUS,
	},
	'ja-JP': {
		...jaJP,
	},
}

export const languages: Languages[] = Object.keys(resources).map((v: any) => {
	return v
})

export const ns = Object.keys(enUS)

export type Languages = keyof typeof resources

// export let defaultLanguage: Languages = 'en-US'
export let defaultLanguage: Languages = process.env.DEFAULT_LANGUAGE as any

export const detectionLanguage = () => {
	if (languages.indexOf(navigator.language as any) >= 0) {
		// getI18n().changeLanguage(navigator.language)
		return navigator.language
	} else {
		switch (navigator.language.substring(0, 2)) {
			case 'ja':
				// getI18n().changeLanguage('en-US')
				return 'ja-JP'
			case 'zh':
				// getI18n().changeLanguage('en-US')
				return 'zh-CN'
				break
			case 'en':
				// getI18n().changeLanguage('en-US')
				return 'en-US'
				break

			default:
				// getI18n().changeLanguage('en-US')
				return 'en-US'
				break
		}
	}
}

export const changeLanguage = (language: Languages) => {
	// console.log(
	// 	'----------------changeLanguage lang',
	// 	defaultLanguage,
	// 	i18n.language,
	// 	language
	// )
	process.env.OUTPUT === 'export' && (defaultLanguage = language)
	getI18n().changeLanguage(language)
	// console.log(
	// 	'----------------changeLanguage lang',
	// 	defaultLanguage,
	// 	i18n.language,
	// 	language
	// )
}

export const i18n = i18next
export const t = i18n.t

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources,
		ns: ['common'],
		defaultNS: 'common',
		fallbackLng: defaultLanguage,
		lng: defaultLanguage,
		// fallbackLng: 'en-US',
		// lng: 'en-US',

		keySeparator: false, // we do not use keys in form messages.welcome

		interpolation: {
			escapeValue: false, // react already safes from xss
		},
	})

// console.log('initinitinitinit', i18n.language, defaultLanguage)

export default { i18n, t, languages, resources, ns, defaultLanguage }
