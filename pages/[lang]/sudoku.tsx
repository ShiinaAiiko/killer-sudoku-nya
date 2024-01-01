import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import IndexLayout from '../../layouts/Index'
import {
	Languages,
	changeLanguage,
	defaultLanguage,
	languages,
	ns,
	t,
	i18n,
} from '../../plugins/i18n/i18n'
import StatisticsComponent, {
	StatisticsData,
} from '../../components/Statistics'
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid'
import { bindEvent, snackbar, progressBar, alert } from '@saki-ui/core'
import {
	deepCopy,
	NyaNyaWasm,
	QueueLoop,
	userAgent,
	Debounce,
	WebWorker,
} from '@nyanyajs/utils'
import moment from 'moment'
import { randomUUID } from 'crypto'

import { SakiIcon } from '../../components/saki-ui-react/components'

import sudoku, { SudokuDifficulty } from '../../plugins/sudoku'

import {
	KillerSudokuAnswerItem,
	KillerSudokuData,
	KillerSudokuHistoryAnswerItem,
	KillerSudokuProblemItem,
} from '../../store/game'
import { useDispatch, useSelector } from 'react-redux'
import { methods, AppDispatch, RootState, layoutSlice } from '../../store'
import { storage } from '../../store/storage'
import { Query } from '../../plugins/methods'
import killerSudoku from '../../plugins/killerSudoku'
import { LanguageType } from '../../store/config'
import { useTranslation } from 'react-i18next'

export async function getStaticPaths() {
	console.log('------------------getStaticPaths----------------------')
	return {
		paths:
			process.env.OUTPUT === 'export'
				? languages.map((v) => {
						return {
							params: {
								lang: v,
							},
						}
				  })
				: [],
		fallback: true,
		// fallback: process.env.OUTPUT === 'export',
	}
}

export async function getStaticProps({
	params,
	locale,
}: {
	params: {
		lang: string
	}
	locale: string
}) {
	console.log('------------------getStaticProps22222----------------------')
	console.log('locale', locale)
	process.env.OUTPUT === 'export' && changeLanguage(params.lang as any)
	// changeLanguage(params.lang as any)
	console.log(
		'process.env.OUTPUT',

		// params,
		process.env.OUTPUT === 'export'
	)

	// const res = await fetch(`https://.../posts/${params.id}`)
	// const post = await res.json()

	// return { props: { post } }
	return {
		props: {
			lang: params.lang || defaultLanguage,
		},
	}
}

// { lang }: { lang: Languages }
function SudokuPage(props: any) {
	const { lang = defaultLanguage } = props
	// changeLanguage(props.router.asPath.split('/')[1])
	const { t, i18n } = useTranslation('killerSudokuPage')
	console.log(
		'-------------SudokuPage',
		props,
		i18n.language,

		lang,
		t('pageTitle', {
			ns: 'killerSudokuPage',
		}),
		props.router.asPath.split('/')[1]
	)
	const [mounted, setMounted] = useState(false)
	const config = useSelector((state: RootState) => state.config)
	const api = useSelector((state: RootState) => state.api)
	const saveGameDebounce = useRef<Debounce>(new Debounce())

	const dispatch = useDispatch<AppDispatch>()

	const router = useRouter()

	// useEffect(() => {
	// 	if (lang && typeof window !== undefined && lang !== i18n.language) {
	// 		changeLanguage(lang)
	// 		dispatch(methods.config.setLanguage(lang))
	// 	}
	// }, [lang,])
	console.log('lang', lang, i18n.language)
	useEffect(() => {
		console.log('languseEffect', lang)
		lang && dispatch(methods.config.setLanguage(lang))
	}, [lang])

	// if (lang && typeof window !== undefined && lang !== i18n.language) {
	//   changeLanguage(lang)
	//   // dispatch(methods.config.setLanguage(lang))
	// }

	// if(lang===)

	// if (!lang) {
	// 	return null
	// }

	if (lang && typeof window === undefined && lang !== i18n.language) {
		// changeLanguage(lang)
		// dispatch(methods.config.setLanguage(lang))
	}

	const [num, setNum] = useState(1)

	useEffect(() => {
		setNum(2)
	}, [])

	return (
		<>
			<Head>
				<title>
					{t('pageTitle', {
						ns: 'killerSudokuPage',
					}) +
						' - ' +
						t('appTitle', {
							ns: 'common',
						})}
				</title>
			</Head>
			<div className={'killer-sudoku-page '}>
				{num}
				<p>
					{t('pageTitle', {
						ns: 'killerSudokuPage',
					})}
				</p>
				<p
					onClick={() => {
						router.replace('/zh-CN/sudoku')
					}}
				>
					zh-CN
				</p>
				<p
					onClick={() => {
						router.replace('/en-US/sudoku')
					}}
				>
					en-US
				</p>
				<p
					onClick={() => {
						router.replace('/sudoku')
					}}
				>
					system
				</p>
				{/* <p>
					{t('appTitle', {
						ns: 'common',
					})}
				</p> */}
			</div>
		</>
	)
}

SudokuPage.getLayout = function getLayout(page: any, pageProps: any) {
	return (
		<IndexLayout
			pageProps={{
				...pageProps,
			}}
		>
			{page}
		</IndexLayout>
	)
}
export default SudokuPage
