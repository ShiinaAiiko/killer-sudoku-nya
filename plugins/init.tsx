import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { RootState, AppDispatch, methods, apiSlice } from '../store'
import { useSelector, useStore, useDispatch } from 'react-redux'

import * as nyanyalog from 'nyanyajs-log'
import { initPublic } from './public'
import { sakiui, meowApps } from '../config'
import './i18n/i18n'
import { useTranslation } from 'react-i18next'
nyanyalog.timer()

const Init = () => {
	const { t, i18n } = useTranslation('')
	const router = useRouter()
	const dispatch = useDispatch<AppDispatch>()
	const api = useSelector((state: RootState) => state.api)
	const store = useStore()

	useEffect(() => {
		initPublic()
		const init = async () => {
			await dispatch(methods.config.init()).unwrap()
		}
		init()
	}, [])

	// const lang =
	// 	router.pathname.indexOf('[lang]') >= 0
	// 		? router.asPath.split('/')[1]
	// 		: 'en-US'

	return (
		<>
			<Head>
				<title>
					{t('appTitle', {
						ns: 'common',
					})}
				</title>
				<link rel='icon' href='./icons/icon.ico' />
				<link rel='manifest' href={'/manifest.json'} />
				<script noModule src={sakiui.jsurl}></script>
				<script type='module' src={sakiui.esmjsurl}></script>
				<script noModule src={meowApps.jsurl}></script>
				<script type='module' src={meowApps.esmjsurl}></script>
			</Head>
		</>
	)
}

export default Init
