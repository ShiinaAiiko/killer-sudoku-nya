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
import { addSakiUI } from './methods'
nyanyalog.timer()

const Init = () => {
	const { t, i18n } = useTranslation()
	const dispatch = useDispatch<AppDispatch>()

	useEffect(() => {
		// addSakiUI()
		initPublic()
		const init = async () => {
			await dispatch(methods.config.init()).unwrap()
		}
		init()
	}, [])

  console.log("413213213")

	return (
		<>
			<Head>
				<link rel='icon' href='/icons/icon.ico' />
				<link rel='manifest' href='/manifest.json' />

				<meta httpEquiv='X-UA-Compatible' content='IE=edge'></meta>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1.0'
				></meta>

				<script noModule src={sakiui.jsurl} async></script>
				<script type='module' src={sakiui.esmjsurl} async></script>
				<script noModule src={meowApps.jsurl} async></script>
				<script type='module' src={meowApps.esmjsurl} async></script>
			</Head>
		</>
	)
}

export default Init
