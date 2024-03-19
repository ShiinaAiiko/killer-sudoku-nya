// const i18n = require('./next-i18next.config.js')
const path = require('path')

const withPWA = require('next-pwa')({
	dest: 'public',
	register: true,
	skipWaiting: true,
})
// console.log(i18n)
// console.log(i18n.i18n.locales)
// console.log(i18n.i18n.locales.join(','))

var enUS = require('./plugins/i18n/en-us.json')
var jaJP = require('./plugins/i18n/ja-jp.json')
var zhCN = require('./plugins/i18n/zh-cn.json')
var zhTW = require('./plugins/i18n/zh-tw.json')

const nextConfig = withPWA({
	// ...i18n,
	// i18n: {
	// 	defaultLocale: 'en-US',
	// 	locales: ['en-US', 'zh-CN', 'zh-TW', 'ja-JP'],
	// },

	...(process.env.OUTPUT === 'export'
		? {
				output: 'export',
		  }
		: {}),
	trailingSlash: false,
	reactStrictMode: false,
	swcMinify: false,
	sassOptions: {
		includePaths: [path.join(__dirname, '.')],
		prependData: `@import "./assets/style/base.scss";`,
	},
	env: {
		DEFAULT_LANGUAGE: 'en-US',
		// LANGUAGES: i18n.i18n.locales.join(','),
		OUTPUT: process.env.OUTPUT,
		DOCKER_LOCALHOST: process.env.DOCKER_LOCALHOST,
	},
})

console.log('nextConfig', process.env.OUTPUT, nextConfig)

module.exports = nextConfig
