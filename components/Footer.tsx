import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
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
import { bindEvent } from '@saki-ui/core'
import { Query } from '../plugins/methods'
import { appearanceColors } from '../store/config'

const FooterComponent = (): JSX.Element => {
	const { t, i18n } = useTranslation()
	// console.log('Index Layout')
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])
	const router = useRouter()
	const layout = useSelector((state: RootState) => state.layout)
	const config = useSelector((state: RootState) => state.config)
	const dispatch = useDispatch<AppDispatch>()
	const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
	const [showAppearanceDropdown, setShowAppearanceDropdown] = useState(false)
	return (
		<div className='footer-component'>
			<div className='f-left'>
				<div className='f-language'>
					{mounted ? (
						<saki-dropdown
							visible={showLanguageDropdown}
							floating-direction='Center'
							ref={bindEvent({
								close: () => {
									setShowLanguageDropdown(false)
								},
							})}
						>
							<saki-button
								ref={bindEvent({
									tap: () => {
										console.log('more')
										setShowLanguageDropdown(true)
									},
								})}
								bg-color='transparent'
								padding='10px 6px 10px 12px'
								title='Language'
								border='none'
								type='Normal'
							>
								<div className='f-l-button'>
									<span>
										{t(config.language, {
											ns: 'languages',
										})}
									</span>
									<saki-icon type='BottomTriangle'></saki-icon>
								</div>
							</saki-button>
							<div slot='main'>
								<saki-menu
									ref={bindEvent({
										selectvalue: async (e) => {
											router.replace(
												Query('/killerSudoku', {
													...router.query,
													lang: e.detail.value,
												})
											)
											// dispatch(methods.config.setLanguage(e.detail.value))

											setShowLanguageDropdown(false)
										},
									})}
								>
									{config.languages.map((v) => {
										return (
											<saki-menu-item
												key={v}
												padding='10px 18px'
												font-size='14px'
												value={v}
												active={config.language === v}
											>
												<div
													style={{
														cursor: 'pointer',
													}}
												>
													<span>
														{v !== 'system'
															? t(v, {
																	ns: 'languages',
															  }) +
															  ' - ' +
															  t(v, {
																	ns: 'languages',
																	lng: v,
															  })
															: t(v, {
																	ns: 'languages',
															  })}
													</span>
												</div>
											</saki-menu-item>
										)
									})}
								</saki-menu>
							</div>
						</saki-dropdown>
					) : (
						''
					)}
				</div>
				<div className='f-appearance'>
					{mounted ? (
						<saki-dropdown
							visible={showAppearanceDropdown}
							floating-direction='Center'
							ref={bindEvent({
								close: () => {
									setShowAppearanceDropdown(false)
								},
							})}
						>
							<saki-button
								ref={bindEvent({
									tap: () => {
										console.log('more')
										setShowAppearanceDropdown(true)
									},
								})}
								bg-color='transparent'
								padding='10px 6px 10px 12px'
								title='Language'
								border='none'
								type='Normal'
							>
								<div className='f-l-button'>
									<span>
										{t(config.appearance, {
											ns: 'appearance',
										})}
									</span>
									<saki-icon type='BottomTriangle'></saki-icon>
								</div>
							</saki-button>
							<div slot='main'>
								<saki-menu
									ref={bindEvent({
										selectvalue: async (e) => {
											dispatch(
												configSlice.actions.setAppearance(e.detail.value)
											)

											setShowAppearanceDropdown(false)
										},
									})}
								>
									{config.appearances.map((v) => {
										return (
											<saki-menu-item
												key={v}
												padding='10px 18px'
												font-size='14px'
												value={v}
												active={config.appearance === v}
											>
												<div
													style={{
														cursor: 'pointer',
														color: (appearanceColors as any)[v],
													}}
												>
													<span>
														{t(v, {
															ns: 'appearance',
														})}
													</span>
												</div>
											</saki-menu-item>
										)
									})}
								</saki-menu>
							</div>
						</saki-dropdown>
					) : (
						''
					)}
				</div>
			</div>
			<div className='f-right'>
				<div className='f-r-copyright'>
					<span>{'© ' + new Date().getFullYear() + ' '}</span>
					<a target='_blank' href={'/'}>
						{t('appTitle', {
							ns: 'common',
						})}
					</a>
					<span> - </span>
					<a
						target='_blank'
						href='https://github.com/ShiinaAiiko/killer-sudoku-nya'
					>
						{/* {t('aiikoBlog', {
												ns: 'common',
											})} */}
						Github
					</a>
					<span> - </span>
					<a target='_blank' href='https://im.aiiko.club/invite/78L2tkleM?t=0'>
						{'Shiina Aiiko'}
					</a>
				</div>
			</div>
		</div>
	)
}

export default FooterComponent
