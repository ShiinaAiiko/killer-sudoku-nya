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
// import { userAgent } from './userAgent'
import { userAgent, CipherSignature, NyaNyaWasm } from '@nyanyajs/utils'
import debounce from '@nyanyajs/utils/dist/debounce'
import * as nyanyalog from 'nyanyajs-log'
import { bindEvent } from '@saki-ui/core'
import { language } from '../store/config'
import { storage } from '../store/storage'
import {
	changeLanguage,
	defaultLanguage,
	detectionLanguage,
	languages,
	resources,
	t,
	i18n,
} from '../plugins/i18n/i18n'
import {
	SakiBaseStyle,
	SakiColor,
	SakiTemplateMenuDropdown,
	SakiInit,
	SakiInitLanguage,
	SakiTemplateFooter,
	SakiTemplateHeader,
	SakiAnimationLoading,
} from '../components/saki-ui-react/components'
import { Query, isInPwa } from '../plugins/methods'
import { meowApps, sakiui } from '../config'
import { useTranslation } from 'react-i18next'
// import { SakiFooter } from '../saki-ui'
// import parserFunc from 'ua-parser-js'

const IndexLayout = ({ pageProps, children }: any): JSX.Element => {
	const { t, i18n } = useTranslation()

	const { lang } = pageProps
	if (pageProps && process.env.OUTPUT === 'export') {
		const lang =
			pageProps?.router?.asPath?.split('/')?.[1] ||
			pageProps?.lang ||
			(typeof window === 'undefined' ? defaultLanguage : detectionLanguage())
		// isInPwa()

		// console.log(
		// 	'isInPwa',
		// 	isInPwa(),
		// 	detectionLanguage() as any,
		// )
		pageProps && i18n.language !== lang && changeLanguage(lang)
	}
	console.log('lang', lang)

	useEffect(() => {
		const l = lang || 'system'

		l && dispatch(methods.config.setLanguage(l))
	}, [lang])
	const [mounted, setMounted] = useState(false)
	// console.log('Index Layout')

	// console.log('children', mounted, children.lang, lang)
	const router = useRouter()
	const config = useSelector((state: RootState) => state.config)
	const game = useSelector((state: RootState) => state.game)
	const layout = useSelector((state: RootState) => state.layout)
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
			// console.log('lang', lang, config.languages, queryLang, router.query)
			// dispatch(methods.config.setLanguage(lang))
		}
		init()
	}, [router.query])

	// useEffect(() => {
	// 	router.locale && dispatch(methods.config.setLanguage(router.locale as any))
	// }, [router.locale])

	const basePathname = router.pathname.replace('/[lang]', '')

	return (
		<>
			<Head>
				<title>
					{t('appTitle', {
						ns: 'common',
					})}
				</title>
				<meta
					name='description'
					content={t('pageDescription', {
						ns: 'killerSudokuPage',
					})}
				/>
				<meta
					name='keywords'
					content='Sudoku,Killer Sudoku,数独,杀手数独,數獨,殺手數獨,ナンプレ,キラーナンプレ'
				/>
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
								defalutLanguage={config.defaultLanguage}
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
							<SakiBaseStyle></SakiBaseStyle>
						</>
					) : (
						''
					)}
					{mounted ? (
						<SakiTemplateHeader
							meow-apps
							// fixed
							visible
						>
							<div slot='left'>
								<SakiTemplateMenuDropdown
									ref={(e) => {
										e?.setAppList?.(config.appList)
									}}
									app-text={layout.headerLogoText}
								></SakiTemplateMenuDropdown>
							</div>
							<div slot={'right'}>
								{game.generateKillerSudokuStatus === 0 ? (
									<div className='tb-h-r-generating'>
										<SakiAnimationLoading
											type='rotateEaseInOut'
											width='20px'
											height='20px'
											border='3px'
											border-color='var(--saki-default-color)'
										/>
										<span
											style={{
												color: '#555',
												fontSize: '12px',
												wordBreak: 'break-all',
											}}
										>
											{t('generatingBackground', {
												ns: 'prompt',
											})}
										</span>
									</div>
								) : (
									''
								)}
							</div>
						</SakiTemplateHeader>
					) : (
						''
					)}
					<div className={'tb-main scrollBarHover'}>
						<div className='tb-main-wrap'>
							{children}

							{mounted ? (
								<SakiTemplateFooter
									onChangeLanguage={async (e) => {
										// router.locale = e.detail
										console.log(router, e)
										console.log(router.locale)
										console.log(
											Query(router.pathname, {
												...router.query,
												lang: '',
											})
										)
										console.log(pageProps.difficulty)
										const pathname = Query(
											(e.detail === 'system' ? '' : '/' + e.detail) +
												basePathname,
											{
												...router.query,
												lang: '',
											}
										)
										console.log('pathname', pathname)
										await storage.global.set(
											'pathname',
											Query(pathname.split('?')?.[0], {
												...router.query,
												lang: '',
												d: '',
											})
										)
										router.replace(pathname)
										// router.replace(pathname, pathname, {
										// 	locale:
										// 		e.detail === 'system' ? detectionLanguage() : e.detail,
										// })
										// dispatch(methods.config.setLanguage(e.detail.value))
									}}
                  onChangeAppearance={(e) => {
                    console.log(e)
										dispatch(
											configSlice.actions.setAppearance(e.detail.value)
										)
									}}
									appearance={config.appearance}
									app-title={t('appTitle', {
										ns: 'common',
									})}
									github
									github-link='https://github.com/ShiinaAiiko/killer-sudoku-nya'
									github-text='Github'
									blog
								></SakiTemplateFooter>
							) : (
								''
							)}
						</div>

						<div style={{ display: 'none' }}>
							{languages.map((v) => {
								return (
									<a key={v} href={'/' + v + basePathname}>
										{t(v, {
											ns: 'languages',
										})}
									</a>
								)
							})}
						</div>
					</div>
				</>
				{/* <script noModule src={sakiui.jsurl}></script>
				<script type='module' src={sakiui.esmjsurl}></script> */}
			</div>
		</>
	)
}

export default IndexLayout
