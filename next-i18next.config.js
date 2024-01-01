// @ts-check

const fs = require('fs')
const path = require('path')

const mkdir = (dirpath) => {
	if (!fs.existsSync(path.dirname(dirpath))) {
		mkdir(path.dirname(dirpath))
	}
	!fs.existsSync(dirpath) && fs.mkdirSync(dirpath)
}

var pathName = path.join(__dirname, './plugins/i18n')
var targetPath = path.join(__dirname, './public/languages')

/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
	// https://www.i18next.com/overview/configuration-options#logging
	debug: process.env.NODE_ENV === 'development',
	i18n: {
		defaultLocale: 'en-US',
		locales: ['en-US', 'ja-JP', 'zh-CN', 'zh-TW'],
	},
	/** To avoid issues when deploying to some paas (vercel...) */
	localePath:
		typeof window === 'undefined'
			? require('path').resolve('./public/languages')
			: '/languages',
	reloadOnPrerender: process.env.NODE_ENV === 'development',

	/**
	 * @link https://github.com/i18next/next-i18next#6-advanced-configuration
	 */
	// saveMissing: false,
	// strictMode: true,
	// serializeConfig: false,
	// react: { useSuspense: false }
}

fs.readdir(pathName, (err, files) => {
	for (var i = 0; i < files.length; i++) {
		const lang = files[i]
		const filePath = path.join(pathName, lang)

		path.extname(filePath) === '.json' &&
			fs.stat(filePath, (err, file) => {
				try {
					// console.log(file.isFile())
					if (file.isFile()) {
						const jsonText = fs.readFileSync(filePath, 'utf8')

						if (!jsonText) return
						const json = JSON.parse(jsonText)
						// console.log(json)
						const nLang = lang
							.replace('.json', '')
							.split('-')
							.map((v, i) => {
								return i === 1 ? v.toUpperCase() : v
							})
							.join('-')
						mkdir(path.join(targetPath, nLang))

						Object.keys(json).forEach((k) => {
							const nsPath = path.join(targetPath, nLang, k + '.json')

							// console.log(nsPath, path.dirname(nsPath), k)

							fs.writeFile(
								nsPath,
								JSON.stringify(json[k], null, '\t'),
								(error) => {
									// 创建失败
									if (error) {
										console.error(error)
										return
									}
								}
							)
						})
					}
				} catch (error) {
					console.error(error)
				}
			})
	}
})
