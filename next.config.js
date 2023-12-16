const path = require('path')

/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
	dest: 'public',
	register: true,
	skipWaiting: true,
})

module.exports = withPWA({
	reactStrictMode: false,
	swcMinify: false,
	sassOptions: {
		includePaths: [path.join(__dirname, '.')],
		prependData: `@import "./assets/style/base.scss";`,
	},
	env: {
		CLIENT_ENV: process.env.CLIENT_ENV,
		DOCKER_LOCALHOST: process.env.DOCKER_LOCALHOST,
	},
})
