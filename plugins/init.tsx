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

	return (
		<>
			<Head>
				<title>
					{t('appTitle', {
						ns: 'common',
					})}
				</title>
				<link rel='icon' href='./icons/icon.ico' />
				<link rel='manifest' href='/manifest.json' />
				<script noModule src={sakiui.jsurl}></script>
				<script type='module' src={sakiui.esmjsurl}></script>
				<script noModule src={meowApps.jsurl}></script>
				<script type='module' src={meowApps.esmjsurl}></script>

				<meta
					name='description'
					content='可免费在Web上玩的数独游戏，有4个难度可选择，DLX算法实时生成数独问题。欢迎来挑战数独并享受解题的快乐！~'
				/>
				<meta
					name='keywords'
					content='Sudoku,Killer Sudoku,数独,杀手数独,數獨,殺手數獨,ナンプレ,キラーナンプレ'
				/>
			</Head>
		</>
	)
}

export default Init
