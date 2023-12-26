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
import { languages, resources } from '../plugins/i18n/i18n'
import {
	SakiBaseStyle,
	SakiColor,
	SakiFooter,
	SakiInit,
	SakiInitLanguage,
} from '../components/saki-ui-react'
// import { SakiFooter } from '../saki-ui'
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

	useEffect(() => {
		updateAppearance()
	}, [config.appearance])

	const updateAppearance = () => {
		switch (config.appearance) {
			case 'Pink':
				break

			case 'Blue':
				break

			default:
				break
		}
	}

	const initNyaNyaWasm = async () => {
		NyaNyaWasm.setWasmPath('./nyanyajs-utils-wasm.wasm')
		NyaNyaWasm.setCoreJsPath('./wasm_exec.js')
	}

	useEffect(() => {
		const init = async () => {
			if (!router.isReady) {
				// console.log('lang设置1')

				// dispatch(
				// 	methods.config.setLanguage(
				// 		(await storage.global.get('language')) || 'system'
				// 	)
				// )
				// console.log('lang设置')
				return
			}

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
			console.log('lang', lang, config.languages, queryLang, router.query)
			dispatch(methods.config.setLanguage(lang))
		}
		init()
	}, [router.query])

	return (
		<>
			<Head>
				<meta httpEquiv='X-UA-Compatible' content='IE=edge'></meta>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1.0'
				></meta>
			</Head>
			<div className={'tool-box-layout ' + config.appearance}>
				<>
					{mounted ? (
						<>
							<SakiInit
								onMounted={() => {
									dispatch(configSlice.actions.setSakiUILoadStatus(true))

									// setProgressBar(progressBar + 0.2 >= 1 ? 1 : progressBar + 0.2)
									// setProgressBar(.6)
									;(window as any)?.sakiui?.initAppearances?.([
										{
											value: 'Pink',
											color: '#f29cb2',
										},
										{
											value: 'Blue',
											color: '#3393ce',
										},
									])
								}}
							></SakiInit>
							<SakiInitLanguage
								language={config.language}
								lang={config.lang}
								defalutLanguage={'en-US'}
								ref={(e) => {
									e?.initLanguage?.(config.languages, resources as any)
								}}
							></SakiInitLanguage>
							<SakiColor
								// appearance={config.appearance}
								defaultColor={
									config.appearance === 'Blue' ? '#3493cd' : '#f29cb2'
								}
								defaultHoverColor={
									config.appearance === 'Blue' ? '#abd6f3' : '#f185a0'
								}
								defaultActiveColor={
									config.appearance === 'Blue' ? '#89c7f0' : '#ce5d79'
								}
								defaultBorderColor={
									config.appearance === 'Blue' ? '#f1f1f1' : '#f1f1f1'
								}
							></SakiColor>
						</>
					) : (
						''
					)}
					{mounted ? <SakiBaseStyle></SakiBaseStyle> : ''}

					<HeaderComponent visible={true} fixed={false}></HeaderComponent>
					<div className={'tb-main scrollBarHover'}>
						<div className='tb-main-wrap'>{children}</div>
						{/* 1111111 1111
						{mounted ? (
							<SakiFooter
								onChangeLanguage={(e) => {
									console.log(e)
								}}
								github
								githubText='1'
								appLink='1'
							></SakiFooter>
						) : (
							''
						)}
						11111111111 */}
					</div>
				</>
			</div>
		</>
	)
}

export default ToolboxLayout
