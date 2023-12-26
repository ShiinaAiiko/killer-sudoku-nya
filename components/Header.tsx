import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
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
import { useSelector, useStore, useDispatch } from 'react-redux'
import axios from 'axios'
import { appListUrl } from '../config'
import MenuDropdownComponent from '../components/MenuDropdown'
const HeaderComponent = ({
	// 暂时仅fixed可用
	visible = true,
	fixed = false,
}: {
	visible: boolean
	fixed: boolean
}) => {
	const { t, i18n } = useTranslation('randomPasswordPage')
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])
	const store = useStore()

	const router = useRouter()
	const { redirectUri, deviceId, appId, disableHeader } = router.query
	const game = useSelector((state: RootState) => state.game)
	const config = useSelector((state: RootState) => state.config)

	return (
		<div
			className={
				'tb-header ' + (fixed ? ' fixed' : '') + (!visible ? ' hide' : '')
			}
		>
			<div className='tb-h-left'>
				<div className='logo-text'>
					{/* {layout.headerLogoText} */}
					{/* {t('appTitle', {
						ns: 'common',
					})} */}

					<MenuDropdownComponent />
				</div>
			</div>
			<div className='tb-h-center'></div>
			<div className='tb-h-right'>
				{game.generateKillerSudokuStatus === 0 ? (
					<div className='tb-h-r-generating'>
						<saki-animation-loading
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
				{mounted && (
					<meow-apps-dropdown
						bg-color='rgba(0,0,0,0)'
						language={config.lang}
					></meow-apps-dropdown>
				)}
			</div>
		</div>
	)
}

export default HeaderComponent
