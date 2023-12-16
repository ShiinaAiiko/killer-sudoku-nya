import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
// import './App.module.scss'
import { useSelector, useStore, useDispatch } from 'react-redux'
import {
	RootState,
	userSlice,
	AppDispatch,
	layoutSlice,
	methods,
	configSlice,
} from '../store'
import { useTranslation } from 'react-i18next'
// import { userAgent } from './userAgent'
import { userAgent, CipherSignature, NyaNyaWasm } from '@nyanyajs/utils'
import debounce from '@nyanyajs/utils/dist/debounce'
import * as nyanyalog from 'nyanyajs-log'
import HeaderComponent from '../components/Header'
import { bindEvent } from '@saki-ui/core'
import { language } from '../store/config'
import { storage } from '../store/storage'
import { languages } from '../plugins/i18n/i18n'
// import parserFunc from 'ua-parser-js'

const ToolboxLayout = ({ children }: propsType): JSX.Element => {
	const { t, i18n } = useTranslation()
	const [mounted, setMounted] = useState(false)
	// console.log('Index Layout')

	const router = useRouter()
	const config = useSelector((state: RootState) => state.config)
	const dispatch = useDispatch<AppDispatch>()

	const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

	useEffect(() => {
		setMounted(true)
		// initNyaNyaWasm()

		window.addEventListener('resize', () => {
			dispatch(methods.config.getDeviceType())
		})
	}, [])
	const initNyaNyaWasm = async () => {
		NyaNyaWasm.setWasmPath('./nyanyajs-utils-wasm.wasm')
		NyaNyaWasm.setCoreJsPath('./wasm_exec.js')
	}

	useEffect(() => {
		const init = async () => {
			if (!router.isReady) return

			const queryLang = String(router.query.lang)
				? String(router.query.lang)
						.split('-')
						.map((v, i) => {
							return i === 1 ? v.toUpperCase() : v
						})
						.join('-')
				: ''
			const lang = config.languages.includes(queryLang as any)
				? (queryLang as any)
				: (await storage.global.get('language')) || 'system'
			// console.log('lang', lang, config.languages, queryLang, router.query)
			dispatch(methods.config.setLanguage(lang))
		}
		init()
	}, [router.query.lang])

	return (
		<>
			<Head>
				<meta httpEquiv='X-UA-Compatible' content='IE=edge'></meta>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1.0'
				></meta>
			</Head>
			<div className='tool-box-layout'>
				<>
					{mounted ? (
						<>
							<saki-dialog-progress-bar></saki-dialog-progress-bar>
							<saki-init
								ref={bindEvent({
									mounted() {
										dispatch(configSlice.actions.setSakiUILoadStatus(true))
										// setProgressBar(progressBar + 0.2 >= 1 ? 1 : progressBar + 0.2)
										// setProgressBar(.6)
									},
								})}
							></saki-init>
						</>
					) : (
						''
					)}
					{mounted ? <saki-base-style></saki-base-style> : ''}

					<HeaderComponent visible={true} fixed={false}></HeaderComponent>
					<div className={'tb-main scrollBarHover'}>
						<div className='tb-main-wrap'>{children}</div>
					</div>
				</>
			</div>
		</>
	)
}

export default ToolboxLayout
