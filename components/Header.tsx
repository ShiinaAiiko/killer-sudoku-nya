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
	const layout = useSelector((state: RootState) => state.layout)
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
