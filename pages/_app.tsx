import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { Router } from 'next/router'
import '../layouts/Index.scss'
import './killerSudoku.scss'
import '../components/Statistics.scss'
import IndexLayout from '../layouts/Index'

import { useRouter } from 'next/router'
import { Provider } from 'react-redux'
import store from '../store'
import Init from '../plugins/init'

import * as nyanyalog from 'nyanyajs-log'

nyanyalog.timer()
nyanyalog.config({
	format: {
		function: {
			fullFunctionChain: false,
		},
		prefixTemplate: '[{{Timer}}] [{{Type}}] [{{File}}]@{{Name}}',
	},
})
// import '../assets/style/base.scss'

function App({ Component, pageProps }: any) {
	const getLayout = Component.getLayout || ((page: any) => page)

	const router = useRouter()

	// console.log('getLayout', !!getLayout())
	return (
		<Provider store={store}>
			<Init />
			{/* <IndexLayout>
				<Component router={router} {...pageProps} />
			</IndexLayout> */}
			{getLayout() ? (
				getLayout(<Component router={router} {...pageProps} />, pageProps)
			) : (
				<Component router={router} {...pageProps} />
			)}
		</Provider>
	)
}

export default (App)
