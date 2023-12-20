import Head from 'next/head'
import IndexLayout from '../layouts/Index'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import FooterComponent from '../components/Footer'
import path from 'path'
import {
	RootState,
	AppDispatch,
	layoutSlice,
	useAppDispatch,
	methods,
	apiSlice,
} from '../store'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { bindEvent, snackbar, progressBar, alert } from '@saki-ui/core'
import {
	deepCopy,
	NyaNyaWasm,
	QueueLoop,
	userAgent,
	Debounce,
} from '@nyanyajs/utils'
import {
	getRegExp,
	copyText,
	getRandomPassword,
	Query,
} from '../plugins/methods'
import { getGeoInfo } from 'findme-js'
import { dlx } from '../plugins/dlx'
import sudoku, { SudokuDifficulty } from '../plugins/sudoku'

import {
	generateKillerSudoku,
	getSeparationsFromAreas,
} from 'killer-sudoku-generator'
import moment from 'moment'
import { storage } from '../store/storage'
import {
	KillerSudokuAnswerItem,
	KillerSudokuData,
	KillerSudokuHistoryAnswerItem,
	KillerSudokuProblemItem,
} from '../store/game'
import killerSudoku from '../plugins/killerSudoku'

const KillerSudokuPage = () => {
	const { t, i18n } = useTranslation('killerSudokuPage')
	const [mounted, setMounted] = useState(false)
	const config = useSelector((state: RootState) => state.config)
	const api = useSelector((state: RootState) => state.api)
	const saveGameDebounce = useRef<Debounce>(new Debounce())

	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [openMenuDropDownMenu, setOpenMenuDropDownMenu] = useState(false)
	const [openInputModeDropDown, setOpenInputModeDropDown] = useState(false)
	const [openMoreDropDownMenu, setOpenMoreDropDownMenu] = useState(false)
	const [openNewGameDropDownMenu, setOpenNewGameDropDownMenu] = useState(false)
	const [isStart, setIsStart] = useState(false)
	const [isInitQueryProblem, setIsInitQueryProblem] = useState(false)
	const [isSolve, setIsSolve] = useState<0 | 1 | 2>(0)
	const [isOpenNote, setIsOpenNote] = useState(false)
	const [isOpenErase, setIsOpenErase] = useState(false)
	const [isRestoreGame, setIsRestoreGame] = useState(false)
	const [inputNum, setInputNum] = useState(0)
	const [time, setTime] = useState(0)
	const [inputMode, setInputMode] = useState<'Keyboard' | 'Touch'>('Keyboard')
	const [difficulty, setDifficulty] = useState<SudokuDifficulty | ''>('')
	// const cellAdjacentDirection = useRef<string[][]>([])
	const timer = useRef<NodeJS.Timeout>()
	const [sudokuList, setsudokuList] = useState<number[][]>([])

	const [answer, setAnswer] = useState<KillerSudokuAnswerItem[]>([
		// {
		// 	row: 2,
		// 	col: 1,
		// 	val: 0,
		// 	notes: [1, 2],
		// },
		// {
		// 	row: 3,
		// 	col: 8,
		// 	val: 0,
		// 	notes: [1],
		// },
		// {
		// 	row: 4,
		// 	col: 8,
		// 	val: 3,
		// },
		// {
		// 	row: 1,
		// 	col: 1,
		// 	val: 0,
		// 	notes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
		// },
		// {
		// 	row: 3,
		// 	col: 3,
		// 	val: 9,
		// },
	])

	const [history, setHistory] = useState<KillerSudokuHistoryAnswerItem[]>([])
	// 1 row / 2 col / 3 palace / 4 index
	const [errorSudoku, setErrorSudoku] = useState<number[][]>([[], [], [], []])

	const [selectedGrid, setSelectedGrid] = useState({
		row: -1,
		col: -1,
	})

	const [killerSudokuDiff, setKillerSudokuDiff] =
		useState<SudokuDifficulty>('Easy')
	const [problem, setProblem] = useState<KillerSudokuProblemItem[]>([])

	const dispatch = useDispatch<AppDispatch>()

	useEffect(() => {
		const init = async () => {
			console.log(
				!isRestoreGame,
				!isInitQueryProblem,
				!config.loadStatus.sakiUI,
				!router.isReady
			)
			if (
				!isRestoreGame ||
				!isInitQueryProblem ||
				!config.loadStatus.sakiUI ||
				!router.isReady
			)
				return
			const diff = ['Easy', 'Moderate', 'Hard', 'Extreme'].includes(
				String(router.query.d)
			)
				? (String(router.query.d) as any)
				: (await storage.global.get('difficulty')) || 'Easy'
			console.log(diff, difficulty, isRestoreGame)
			if (diff === difficulty) return

			// 有就直接生成，没有则New
			if (router.query.d) {
				setOpenNewGameDropDownMenu(false)
				setDifficulty(diff)

				generateKillerSudoku(diff, problem.length === 0)
			}
		}
		init()
	}, [
		router.query.d,
		config.loadStatus.sakiUI,
		isInitQueryProblem,
		isRestoreGame,
	])

	useEffect(() => {
		const init = async () => {
			if (!config.loadStatus.sakiUI || !router.isReady) return

			// console.log('开始init', router.query.p)

			const diff = ['Easy', 'Moderate', 'Hard', 'Extreme'].includes(
				String(router.query.d)
			)
			if (!router.query.p || !router.query.d || !diff) {
				setIsInitQueryProblem(true)
				return
			}
			try {
				// console.log(router.query.p)
				const ks = String(router.query.p)
					.split('_')
					.map((v) => {
						const vArr = v.split('-')
						const v1Arr = vArr[1].split('')
						const list: any[] = []
						for (let i = 0; i < v1Arr.length / 3; i++) {
							list.push({
								row: Number(v1Arr[i * 3 + 0]),
								col: Number(v1Arr[i * 3 + 1]),
								val: Number(v1Arr[i * 3 + 2]),
							})
						}
						return {
							type: 'Sum',
							val: Number(vArr[0]),
							list: list,
						}
					})
				// console.log(ks)

				initKS(ks as any, String(router.query.d) as any, [], [], 0, 0)

				setIsRestoreGame(true)
			} catch (error) {
				console.error(error)
			}
			setIsInitQueryProblem(true)
			// const diff = ['Easy', 'Moderate', 'Hard', 'Extreme'].includes(
			// 	String(router.query.d)
			// )
			// 	? (String(router.query.d) as any)
			// 	: (await storage.global.get('difficulty')) || 'Easy'
			// console.log(diff, difficulty, isRestoreGame)
			// if (diff === difficulty) return

			// // 有就直接生成，没有则New
			// if (router.query.d) {
			// 	setDifficulty(diff)

			// 	generateKillerSudoku(diff, killerSudoku.length === 0)
			// }
		}
		init()
	}, [router.query.p, router.query.d, config.loadStatus.sakiUI])

	useEffect(() => {
		setMounted(true)
		// console.log('userAgent', )

		// const iframe = document.createElement('iframe')

		// iframe.src = location.origin + '/generate?d=Easy'

		// iframe.style.display = 'none'
		// window.addEventListener(
		// 	'message',
		// 	(e) => {
		// 		console.log('message', e)
		// 	},
		// 	false
		// )
		// document.body.appendChild(iframe)

		setInputMode(
			userAgent(window.navigator.userAgent).os.name === 'Windows'
				? 'Keyboard'
				: 'Touch'
		)
	}, [])

	useEffect(() => {
		timer.current && clearTimeout(timer.current)
		if (isStart) {
			timer.current = setTimeout(() => {
				if (isStart && !isSolve) {
					setTime(time + 1)
				}
			}, 1000)
		}
	}, [isStart, time, isSolve])

	useEffect(() => {
		window.onkeyup = keyUpEvent

		// window.removeEventListener('keyup', keyUpEvent)
		// window.addEventListener('keyup', keyUpEvent)
	}, [selectedGrid.row, selectedGrid.col, answer, history, isOpenNote, isSolve])

	useEffect(() => {
		dispatch(layoutSlice.actions.setLayoutHeaderLogoText(t('pageTitle')))
	}, [i18n.language])

	useEffect(() => {
		const ca = checkAnswer(answer)
		if (ca) {
			isSolveFunc(answer)
		}
		saveGame()
	}, [answer])

	useEffect(() => {
		console.log(isSolve)
		if (isSolve > 0) {
			deleteGame()
		}
		if (isSolve === 2) {
			timer.current && clearTimeout(timer.current)
			alert({
				title: t('solvedSuccessfully', {
					ns: 'killerSudokuPage',
				}),
				content: t('solvedSuccessfullyContent', {
					ns: 'killerSudokuPage',
				})
					.replace(
						'${difficulty}',
						t(difficulty.toLowerCase(), {
							ns: 'killerSudokuPage',
						})
					)
					.replace('${m}', String(Math.floor(time / 60)))
					.replace('${s}', String(time % 60)),
				cancelText: t('viewAnswers', {
					ns: 'killerSudokuPage',
				}),
				confirmText: t('newgame', {
					ns: 'killerSudokuPage',
				}),
				onCancel() {
					initKS([], killerSudokuDiff, answer, history, time)
				},
				onConfirm() {
					// generate()
					generateKillerSudoku(difficulty, true)
				},
			}).open()
		}
	}, [isSolve])

	const generateKillerSudoku = (
		difficulty: SudokuDifficulty | '',
		frist: boolean
	) => {
		if (!difficulty) return
		const generate = () => {
			let pb = progressBar({
				width: '100%',
				maxWidth: '300px',
			})
			pb.open()
			pb.setProgress({
				progress: 0.1,
				tipText: t('generating', {
					ns: 'killerSudokuPage',
				}),
				onAnimationEnd() {
					console.time('killerSudoku.generateProblem')
					const myWorker = new Worker('/webworker-bundle.js') // 创建worker

					myWorker.addEventListener('message', (e: any) => {
						// 接收消息
						console.log('problem', e.data) // Greeting from Worker.js，worker线程发送的消息

						const generateProblem = e.data

						initKS(
							generateProblem.problem,
							generateProblem.difficulty,
							[],
							// generateProblem.solution
							// 	.map((v, i) => {
							// 		const row = Math.floor(i / 9) + 1
							// 		const col = (i % 9) + 1
							// 		return {
							// 			row: row,
							// 			col: col,
							// 			val: v,
							// 			notes: [],
							// 		}
							// 	})
							// 	.filter((_, i) => {
							// 		return i !== 80
							// 	}),
							[],
							0,
							0
						)

						timer && clearInterval(timer)
						pb.setProgress({
							progress: 1,
							tipText: t('generatedSuccessfully', {
								ns: 'killerSudokuPage',
							}),
							onAnimationEnd() {
								pb.close()
								pb = undefined as any
							},
						})
						console.timeEnd('killerSudoku.generateProblem')
					})

					// 这种写法也可以
					// myWorker.onmessage = e => { // 接收消息
					//    console.log(e.data);
					// };

					myWorker.postMessage({
						sudoku: [],
						difficulty: difficulty,
					})
					// setTimeout(() => {
					// 	// if (window.Worker) {
					// 	//   console.log(window.Worker)
					// 	//   const myWorker = new Worker('/sudokuWorker.js') // 创建worker

					// 	//   myWorker.addEventListener('message', (e) => {
					// 	//     // 接收消息
					// 	//     console.log('message=> ', e.data) // Greeting from Worker.js，worker线程发送的消息
					// 	//   })

					// 	//   myWorker.postMessage('Greeting from Main.js')
					// 	// }
					// 	console.time('killerSudoku.generateProblem')
					// 	let getSudoku = [
					// 		3, 7, 5, 4, 6, 1, 2, 8, 9, 1, 9, 4, 8, 2, 7, 6, 5, 3, 2, 8, 6, 3,
					// 		5, 9, 4, 1, 7, 4, 2, 3, 5, 7, 8, 1, 9, 6, 7, 5, 1, 9, 4, 6, 3, 2,
					// 		8, 8, 6, 9, 2, 1, 3, 7, 4, 5, 9, 1, 7, 6, 8, 2, 5, 3, 4, 6, 4, 8,
					// 		1, 3, 5, 9, 7, 2, 5, 3, 2, 7, 9, 4, 8, 6, 1,
					// 	]
					// 	getSudoku = []
					// 	const generateProblem = sudoku.killerSudoku.generateProblem(
					// 		getSudoku,
					// 		difficulty
					// 	)
					// 	console.log('generateProblem', generateProblem)

					// 	// const generateProblem: ReturnType<
					// 	// 	typeof sudoku.killerSudoku.generateProblem
					// 	// > = JSON.parse(
					// 	// 	'{"problem":[{"type":"Sum","val":14,"list":[{"row":1,"col":1,"val":0},{"row":2,"col":1,"val":1},{"row":3,"col":1,"val":0}]},{"type":"Sum","val":10,"list":[{"row":1,"col":2,"val":2},{"row":1,"col":3,"val":0}]},{"type":"Sum","val":12,"list":[{"row":1,"col":4,"val":0},{"row":1,"col":5,"val":0},{"row":2,"col":5,"val":8}]},{"type":"Sum","val":14,"list":[{"row":1,"col":6,"val":0},{"row":1,"col":7,"val":5}]},{"type":"Sum","val":7,"list":[{"row":1,"col":8,"val":0},{"row":2,"col":8,"val":0}]},{"type":"Sum","val":15,"list":[{"row":1,"col":9,"val":0},{"row":2,"col":9,"val":7},{"row":3,"col":9,"val":0}]},{"type":"Sum","val":8,"list":[{"row":2,"col":3,"val":5},{"row":3,"col":3,"val":0}]},{"type":"Sum","val":2,"list":[{"row":2,"col":4,"val":2}]},{"type":"Sum","val":17,"list":[{"row":2,"col":6,"val":6},{"row":3,"col":6,"val":0},{"row":4,"col":6,"val":7}]},{"type":"Sum","val":8,"list":[{"row":3,"col":8,"val":0}]},{"type":"Sum","val":14,"list":[{"row":4,"col":3,"val":0},{"row":4,"col":4,"val":0},{"row":5,"col":4,"val":4}]},{"type":"Sum","val":15,"list":[{"row":4,"col":8,"val":1},{"row":4,"col":9,"val":0},{"row":5,"col":9,"val":0}]},{"type":"Sum","val":8,"list":[{"row":5,"col":2,"val":0},{"row":5,"col":3,"val":1}]},{"type":"Sum","val":15,"list":[{"row":5,"col":7,"val":0},{"row":5,"col":8,"val":0},{"row":6,"col":8,"val":0}]},{"type":"Sum","val":17,"list":[{"row":6,"col":2,"val":0},{"row":7,"col":2,"val":6},{"row":8,"col":2,"val":8}]},{"type":"Sum","val":19,"list":[{"row":6,"col":3,"val":0},{"row":7,"col":3,"val":0},{"row":8,"col":3,"val":4}]},{"type":"Sum","val":6,"list":[{"row":6,"col":4,"val":0},{"row":7,"col":4,"val":0}]},{"type":"Sum","val":13,"list":[{"row":6,"col":9,"val":8},{"row":7,"col":9,"val":4},{"row":8,"col":9,"val":0}]},{"type":"Sum","val":8,"list":[{"row":7,"col":1,"val":0},{"row":8,"col":1,"val":0}]},{"type":"Sum","val":3,"list":[{"row":9,"col":1,"val":2},{"row":9,"col":2,"val":0}]},{"type":"Sum","val":17,"list":[{"row":9,"col":3,"val":0},{"row":9,"col":4,"val":0},{"row":9,"col":5,"val":0}]},{"type":"Sum","val":13,"list":[{"row":9,"col":6,"val":5},{"row":9,"col":7,"val":8}]},{"type":"Sum","val":21,"list":[{"row":7,"col":5,"val":3},{"row":8,"col":5,"val":0},{"row":8,"col":6,"val":0},{"row":8,"col":4,"val":0}]},{"type":"Sum","val":19,"list":[{"row":7,"col":8,"val":0},{"row":8,"col":8,"val":5},{"row":9,"col":8,"val":0},{"row":9,"col":9,"val":0}]},{"type":"Sum","val":15,"list":[{"row":5,"col":5,"val":9},{"row":6,"col":5,"val":0},{"row":6,"col":6,"val":1},{"row":5,"col":6,"val":0}]},{"type":"Sum","val":18,"list":[{"row":3,"col":4,"val":0},{"row":3,"col":5,"val":0},{"row":4,"col":5,"val":6}]},{"type":"Sum","val":17,"list":[{"row":5,"col":1,"val":0},{"row":6,"col":1,"val":0}]},{"type":"Sum","val":4,"list":[{"row":3,"col":7,"val":0},{"row":4,"col":7,"val":3}]},{"type":"Sum","val":9,"list":[{"row":2,"col":7,"val":0}]},{"type":"Sum","val":25,"list":[{"row":6,"col":7,"val":4},{"row":7,"col":7,"val":0},{"row":8,"col":7,"val":0},{"row":7,"col":6,"val":0}]},{"type":"Sum","val":18,"list":[{"row":2,"col":2,"val":0},{"row":3,"col":2,"val":0},{"row":4,"col":2,"val":0}]},{"type":"Sum","val":4,"list":[{"row":4,"col":1,"val":0}]}],"difficulty":"Easy","solution":[7,2,8,3,1,9,5,4,6,1,4,5,2,8,6,9,3,7,6,9,3,7,5,4,1,8,2,4,5,2,8,6,7,3,1,9,8,7,1,4,9,3,2,6,5,9,3,6,5,2,1,4,7,8,5,6,9,1,3,8,7,2,4,3,8,4,9,7,2,6,5,1,2,1,7,6,4,5,8,9,3]}'
					// 	// )

					// 	// const ans: typeof answer = []
					// 	// let sol = sudoku.killerSudoku.solve(
					// 	// 	generateProblem.problem.map((v) => {
					// 	// 		return {
					// 	// 			type: 'Sum',
					// 	// 			val: v.val,
					// 	// 			list: v.list.map((v) => {
					// 	// 				ans.push({
					// 	// 					row: v.row,
					// 	// 					col: v.col,
					// 	// 					val: generateProblem.solution[
					// 	// 						(v.row - 1) * 9 + v.col - 1
					// 	// 					],
					// 	// 				})
					// 	// 				return {
					// 	// 					row: v.row,
					// 	// 					col: v.col,
					// 	// 					val: 0,
					// 	// 				}
					// 	// 			}),
					// 	// 		}
					// 	// 	}),
					// 	// 	{
					// 	// 		maxSolutionCount: 2,
					// 	// 	}
					// 	// )

					// 	// console.log('solve', sol)

					// 	initKS(
					// 		generateProblem.problem,
					// 		generateProblem.difficulty,
					// 		[],
					// 		// generateProblem.solution
					// 		// 	.map((v, i) => {
					// 		// 		const row = Math.floor(i / 9) + 1
					// 		// 		const col = (i % 9) + 1
					// 		// 		return {
					// 		// 			row: row,
					// 		// 			col: col,
					// 		// 			val: v,
					// 		// 			notes: [],
					// 		// 		}
					// 		// 	})
					// 		// 	.filter((_, i) => {
					// 		// 		return i !== 80
					// 		// 	}),
					// 		[],
					// 		0,
					// 		0
					// 	)

					// 	timer && clearInterval(timer)
					// 	pb.setProgress({
					// 		progress: 1,
					// 		tipText: t('generatedSuccessfully', {
					// 			ns: 'killerSudokuPage',
					// 		}),
					// 		onAnimationEnd() {
					// 			pb.close()
					// 			pb = undefined as any
					// 		},
					// 	})
					// 	console.timeEnd('killerSudoku.generateProblem')
					// }, 300)
				},
			})
			let progress = 0.1

			const timer = setInterval(() => {
				progress += 0.1
				if (!pb) {
					clearInterval(timer)
					return
				}
				console.log(pb)
				pb?.setProgress({
					progress,
					tipText: t('generating', {
						ns: 'killerSudokuPage',
					}),
				})
			}, 1000)
			// timer && clearInterval(timer)
		}
		if (!frist && !isSolve) {
			alert({
				title: t('newgame', {
					ns: 'killerSudokuPage',
				}),
				content: t('newgameContent', {
					ns: 'killerSudokuPage',
				}),
				cancelText: t('cancel', {
					ns: 'prompt',
				}),
				confirmText: t('newgame', {
					ns: 'killerSudokuPage',
				}),
				onCancel() {
					setDifficulty(killerSudokuDiff)
					storage.global.setSync('difficulty', killerSudokuDiff)
					router.replace(
						Query('/killerSudoku', {
							...router.query,
							d: killerSudokuDiff,
						})
					)
				},
				onConfirm() {
					generate()
				},
			}).open()
			return
		}
		generate()
	}

	const keyUpEvent = (e: KeyboardEvent) => {
		// console.log('keyup', e.key, Number(e.key) > 0)
		if (e.key === 'Backspace') {
			eraseNumber(selectedGrid.row, selectedGrid.col)
			return
		}

		fillNumber(selectedGrid.row, selectedGrid.col, Number(e.key))
	}

	const fillNumber = (row: number, col: number, num: number) => {
		if (isSolve > 0) return

		if (num > 0 && num < 10 && row > 0 && col > 0) {
			let val = 0
			problem.some((v) => {
				v.list.some((sv) => {
					if (sv.col == col && sv.row == row && sv.val) {
						val = sv.val
						return true
					}
				})
				return !!val
			})
			if (val > 0) {
				return
			}

			const ans = [...answer]
			let index = -1
			ans.some((v, i) => {
				if (v.col == col && v.row == row) {
					index = i
					return true
				}
			})
			// console.log('index', index)

			if (index >= 0 && answer[index].val === num) {
				eraseNumber(row, col)
				return
			}
			// isOpenErase
			// ? answer[index].notes?.filter((v) => v === inputNum)
			//     .length === 1
			// :

			// console.log(num, answer)
			// console.log(isOpenNote)
			// console.log(ans, index, selectedGrid, num)
			if (index < 0) {
				ans.push(
					isOpenNote
						? {
								row: row,
								col: col,
								val: 0,
								notes: [num],
						  }
						: {
								row: row,
								col: col,
								val: num,
								notes: [],
						  }
				)

				setHistory(
					history.concat([
						{
							type: 'Add',
							answerItem: deepCopy(ans[ans.length - 1]),
						},
					])
				)
			} else {
				setHistory(
					history.concat([
						{
							type: 'Update',
							answerItem: deepCopy(ans[index]),
						},
					])
				)
				if (isOpenNote) {
					ans[index].val = 0
					// console.log(ans[index]?.notes)
					if (ans[index]?.notes?.length === 0) {
						ans[index].notes = [num]
					} else {
						if (ans[index].notes?.includes(num)) {
							ans[index].notes = ans[index].notes?.filter((v) => v !== num)
						} else {
							ans[index].notes?.push(num)
						}
					}
					ans[index].notes?.sort((a, b) => {
						return a - b
					})
				} else {
					ans[index].val = num
					ans[index].notes = []
				}
			}
			setAnswer(ans)
		}
	}

	const eraseNumber = (row: number, col: number) => {
		if (isSolve > 0) return

		let index = -1
		let vItem: KillerSudokuAnswerItem | undefined
		const ans = [
			...answer.filter((v, i) => {
				if (v.col == col && v.row == row) {
					index = i
					vItem = deepCopy(v)
				}
				return !(v.col == col && v.row == row)
			}),
		]

		if (index < 0) {
			return
		}
		setHistory(
			history.concat([
				{
					type: 'Erase',
					answerItem: deepCopy(vItem),
				},
			])
		)
		setAnswer(ans)
	}

	const solveSudoku = () => {
		alert({
			title: t('getAnswers', {
				ns: 'killerSudokuPage',
			}),
			content: t('getAnswersContent', {
				ns: 'killerSudokuPage',
			}),
			cancelText: t('cancel', {
				ns: 'prompt',
			}),
			confirmText: t('solve', {
				ns: 'killerSudokuPage',
			}),
			onConfirm() {
				const ans: typeof answer = []
				let sol = killerSudoku.solve(
					problem.map((v) => {
						return {
							type: 'Sum',
							val: v.val,
							list: v.list.map((v) => {
								return {
									row: v.row,
									col: v.col,
									val: 0,
								}
							}),
						}
					}),
					{
						maxSolutionCount: 2,
					}
				)

				console.log('sol', sol)

				if (!sol.length) {
					console.log('无解')
					return
				}
				sol?.[0].forEach((v, i) => {
					const row = Math.floor(i / 9) + 1
					const col = (i % 9) + 1
					// console.log(row, col)
					ans.push({
						row: row,
						col: col,
						val: v,
					})
				})

				clearTimeout(timer.current)
				initKS([], killerSudokuDiff, ans, [], time, 1)
				deleteGame()
			},
		}).open()
	}

	const checkAnswer = (ansList: typeof answer) => {
		const es: number[][] = [[], [], [], []]
		// answer.forEach((v) => {
		// 	console.log(v)
		// 	console.log(
		// 		'answer',
		// 		answer.filter((sv) => {
		// 			return v.val === sv.val && (v.row === sv.row || v.col === sv.col)
		// 		})
		// 	)
		// })

		for (let i = 0; i < 9; i++) {
			// const row = Math.floor(i / 9)
			// const col = i % 9
			// 1、九宫格
			// const palace = sudoku.getPalace(i, row)
			// console.log(row, col, palace)

			// row
			let rowAns: {
				[num: number]: number
			} = {}
			const ansRowList = ansList.filter((v) => v.val && v.row === i)
			ansRowList.forEach((v) => {
				!rowAns[v.val] && (rowAns[v.val] = 0)
				rowAns[v.val]++
			})
			Object.keys(rowAns).forEach((v) => {
				if (rowAns[Number(v)] >= 2) {
					es[0].push(i)

					const ansRowListTemp = ansRowList.filter((sv) => {
						return sv.val === Number(v)
					})
					if (ansRowListTemp.length > 1) {
						ansRowListTemp.forEach((v) => {
							es[3].push((v.row - 1) * 9 + v.col - 1)
						})
					}
				}
			})

			// col
			let colAns: {
				[num: number]: number
			} = {}
			const ansColList = ansList.filter((v) => v.val && v.col === i)
			ansColList.forEach((v) => {
				!colAns[v.val] && (colAns[v.val] = 0)
				colAns[v.val]++
			})
			Object.keys(colAns).forEach((v) => {
				if (colAns[Number(v)] >= 2) {
					es[1].push(i)

					const ansColListTemp = ansColList.filter((sv) => {
						return sv.val === Number(v)
					})
					if (ansColListTemp.length > 1) {
						ansColListTemp.forEach((v) => {
							es[3].push((v.row - 1) * 9 + v.col - 1)
						})
					}
				}
			})

			// palace

			let palaceAns: {
				[num: number]: number
			} = {}
			const ansPalaceList = ansList.filter(
				(v) =>
					v.val && sudoku.getPalace((v.row - 1) * 9 + v.col - 1, v.row) === i
			)
			ansPalaceList.forEach((v) => {
				!palaceAns[v.val] && (palaceAns[v.val] = 0)
				palaceAns[v.val]++
			})
			Object.keys(palaceAns).forEach((v) => {
				if (palaceAns[Number(v)] >= 2) {
					es[2].push(i)

					const ansPalaceListTemp = ansPalaceList.filter((sv) => {
						return sv.val === Number(v)
					})
					if (ansPalaceListTemp.length > 1) {
						ansPalaceListTemp.forEach((v) => {
							es[3].push((v.row - 1) * 9 + v.col - 1)
						})
					}
				}
			})
		}
		console.log('es', es)
		setErrorSudoku(es)

		return (
			es.reduce((pv, cv) => pv + cv.reduce((pv, cv) => pv + cv, 0), 0) === 0
		)
	}

	const isSolveFunc = (ansList: typeof answer) => {
		const answer = [...ansList]

		problem.forEach((v) => {
			v.list.forEach((sv) => {
				if (sv.val) {
					answer.push({
						col: sv.col,
						row: sv.row,
						val: sv.val,
					})
				}
			})
		})

		console.log(answer.reduce((pv, cv) => pv + cv.val, 0))
		if (answer.reduce((pv, cv) => pv + cv.val, 0) === 405) {
			setIsSolve(2)
		}
	}

	const isFourCellAdjacent = (
		list: {
			row: number
			col: number
			val?: number | undefined
		}[]
	) => {
		const indexList = list.map((v) => (v.row - 1) * 9 + v.col - 1)
		indexList.sort((a, b) => a - b)
		for (let i = 0; i < indexList.length - 1; i++) {
			if (indexList[i] + 1 === indexList[i + 1]) {
				for (let j = 0; j < indexList.length - 1; j++) {
					if (
						indexList[i] + 9 === indexList[j] &&
						indexList[i + 1] + 9 === indexList[j + 1]
					) {
						return true
					}
				}
			}
		}
		return false
	}

	const saveGame = async () => {
		if (!problem.length || isSolve !== 0) return
		saveGameDebounce.current.increase(async () => {
			await dispatch(
				methods.game.saveGame({
					key: 'KillerSudoku',
					data: {
						problem: problem,
						answer: answer,
						history: history,
						difficulty: killerSudokuDiff,
						time: time,
					} as KillerSudokuData,
				})
			)
		}, 1000)
	}

	const checkGameOldData = async () => {
		return await dispatch(
			methods.game.checkGameOldData('KillerSudoku')
		).unwrap()
	}

	const deleteGame = async () => {
		saveGameDebounce.current.increase(async () => {
			await dispatch(methods.game.deleteGame('KillerSudoku'))
		}, 100)
	}

	const restoreGame = async () => {
		const gameData: KillerSudokuData = await dispatch(
			methods.game.restoreGame('KillerSudoku')
		).unwrap()
		console.log('gameData', gameData)
		if (gameData) {
			initKS(
				gameData.problem,
				gameData.difficulty,
				gameData.answer,
				gameData.history,
				gameData.time,
				0
			)
		}
		setIsRestoreGame(true)
	}

	const share = async () => {
		const shareFunc = async (saveProblem: boolean) => {
			let url = Query(location.origin + location.pathname, {
				...router.query,
				...{},
			})
			if (saveProblem) {
				let ksStr = problem
					.map((v) => {
						return (
							v.val +
							'-' +
							v.list
								.map((sv, si, sarr) => {
									return sv.row + '' + sv.col + '' + sv.val + ''
								})
								.join('')
						)
					})
					.join('_')
				url = Query(location.origin + location.pathname, {
					...router.query,
					...{
						d: killerSudokuDiff,
						p: ksStr,
					},
				})
				console.log(ksStr)
			}
			console.log(url)

			// const res = await axios({
			// 	method: 'GET',
			// 	url: 'https://link.aiiko.club' + '/api/v1/url/get',
			// 	params: {
			// 		url: url,
			// 	},
			// })

			// if (res.data?.code === 200) {
			// 	url = res.data.data.shortUrl
			// }
			await window.navigator.clipboard.writeText(url)

			snackbar({
				message: t('copySuccessfully', {
					ns: 'prompt',
				}),
				vertical: 'top',
				horizontal: 'center',
				backgroundColor: 'var(--saki-default-color)',
				color: '#fff',
				autoHideDuration: 2000,
			}).open()
		}

		if (problem.length) {
			alert({
				title: t('share', {
					ns: 'prompt',
				}),
				content: t('shareProblemContent', {
					ns: 'killerSudokuPage',
				}),
				cancelText: t('normalShare', {
					ns: 'killerSudokuPage',
				}),
				confirmText: t('shareProblem', {
					ns: 'killerSudokuPage',
				}),
				onCancel() {
					shareFunc(false)
				},
				onConfirm() {
					shareFunc(true)
				},
			}).open()
		} else {
			shareFunc(false)
		}
	}

	const initKS = (
		problem: KillerSudokuProblemItem[],
		difficulty: SudokuDifficulty,
		answer: KillerSudokuAnswerItem[],
		history: KillerSudokuHistoryAnswerItem[],
		time: number,
		isSolve?: 0 | 1 | 2
	) => {
		if (problem.length) {
			for (let i = 1; i < 8; i++) {
				console.log(
					'' +
						i +
						'个格子的数量：' +
						problem.filter((v) => v.list.length === i).length
				)
			}
			setProblem(problem)
			setKillerSudokuDiff(difficulty)
			setDifficulty(difficulty)

			setIsStart(true)
			setIsOpenNote(false)
			setIsOpenErase(false)
			setInputNum(0)
			setSelectedGrid({
				row: -1,
				col: -1,
			})
			setErrorSudoku([[], [], [], []])
			setTime(time || 0)
			setIsSolve(0)
		}

		if (isSolve !== undefined) {
			setIsSolve(isSolve || 0)
		}

		setAnswer(answer || [])
		setHistory(history || [])
	}

	const inputWidth =
		config.window.width <= 640
			? config.window.width <= 460
				? config.window.width - 20
				: config.window.width * 0.7
			: (config.window.width > 880 ? 880 : config.window.width) *
			  (config.deviceType === 'Mobile' ? 0.552 : 0.387)

	const sudokuWidth =
		config.window.width <= 640
			? config.window.width <= 460
				? config.window.width - 20
				: config.window.width * 0.7
			: (config.window.width > 880 ? 880 : config.window.width) *
			  (config.deviceType === 'Mobile' ? 0.552 : 0.592)

	const baseSudokuWidth = sudokuWidth * 0.001923
	return (
		<>
			<Head>
				<title>
					{t('pageTitle', {
						ns: 'killerSudokuPage',
					}) +
						(difficulty
							? '[' +
							  t(difficulty.toLowerCase(), {
									ns: 'killerSudokuPage',
							  }) +
							  ']'
							: '') +
						' - ' +
						t('appTitle', {
							ns: 'common',
						})}
				</title>
			</Head>
			<div className={'killer-sudoku-page ' + config.deviceType}>
				<div className='ks-header'>
					<div className='ks-difficulty'>
						{difficulty ? (
							<>
								{' '}
								<div className='ks-d-title'>
									{t('difficulty', {
										ns: 'killerSudokuPage',
									})}
									:
								</div>
								<div className='ks-d-menu'>
									{mounted ? (
										<saki-dropdown
											visible={openMenuDropDownMenu}
											floating-direction='Left'
											ref={bindEvent({
												close: (e) => {
													setOpenMenuDropDownMenu(false)
												},
											})}
										>
											<div className='ks-d-m-button'>
												<saki-button
													border='none'
													bg-color='rgba(0,0,0,0)'
													ref={bindEvent({
														tap: () => {
															setOpenMenuDropDownMenu(!openMenuDropDownMenu)
														},
													})}
												>
													<span>
														{t(difficulty.toLowerCase(), {
															ns: 'killerSudokuPage',
														})}
													</span>
													<saki-icon
														width='12px'
														height='12px'
														color='#999'
														type='Bottom'
													></saki-icon>
												</saki-button>
											</div>
											<div className='ks-d-m-list' slot='main'>
												<saki-menu
													ref={bindEvent({
														selectvalue: async (e) => {
															console.log(e)
															setOpenMenuDropDownMenu(false)
															// setDifficulty(e.detail.value)
															// generateKillerSudoku(e.detail.value, false)

															storage.global.setSync(
																'difficulty',
																e.detail.value
															)
															router.replace(
																Query('/killerSudoku', {
																	...router.query,
																	d: e.detail.value,
																})
															)
														},
													})}
												>
													{['Easy', 'Moderate', 'Hard', 'Extreme'].map(
														(v, i) => {
															return (
																<saki-menu-item
																	key={i}
																	active={v === difficulty}
																	value={v}
																	min-width='80px'
																	padding={'8px 12px'}
																>
																	<span
																		style={{
																			fontSize: '14px',
																		}}
																	>
																		{t(v.toLowerCase(), {
																			ns: 'killerSudokuPage',
																		})}
																	</span>
																</saki-menu-item>
															)
														}
													)}
												</saki-menu>
											</div>
										</saki-dropdown>
									) : (
										''
									)}
								</div>
							</>
						) : (
							''
						)}
					</div>
					<div className='ks-h-center'>
						<div className='ks-h-c-time'>
							{mounted && (
								<saki-icon
									margin='0 4px 0 0'
									color='#666'
									type='Countdown'
									width='16px'
									height='16px'
								></saki-icon>
							)}
							<span>
								{String(Math.floor(time / 60)).padStart(2, '0')}:
								{String(time % 60).padStart(2, '0')}
							</span>
						</div>
					</div>
					<div className='ks-h-right'>
						<div className='ks-h-r-inputMode'>
							{mounted ? (
								<saki-dropdown
									visible={openInputModeDropDown}
									floating-direction='Left'
									ref={bindEvent({
										close: (e) => {
											setOpenInputModeDropDown(false)
										},
									})}
								>
									<div className='ks-d-m-button'>
										<span>
											{inputMode === 'Keyboard'
												? t('keyboardInput', {
														ns: 'killerSudokuPage',
												  })
												: t('touchInput', {
														ns: 'killerSudokuPage',
												  })}
										</span>
										<saki-button
											type='CircleIconGrayHover'
											ref={bindEvent({
												tap: () => {
													setOpenInputModeDropDown(!openInputModeDropDown)
												},
											})}
										>
											{inputMode === 'Keyboard' ? (
												<saki-icon
													width='16px'
													height='16px'
													color='#666'
													type='Keyboard'
												></saki-icon>
											) : (
												<saki-icon
													width='16px'
													height='16px'
													color='#666'
													type='Touch'
												></saki-icon>
											)}
										</saki-button>
									</div>
									<div className='inputMode-list' slot='main'>
										<saki-menu
											ref={bindEvent({
												selectvalue: async (e) => {
													setOpenInputModeDropDown(false)

													setInputNum(0)

													setIsOpenErase(false)
													// if (e.detail.value === 'Keyboard') {
													// }
													setInputMode(e.detail.value)
													// setDifficulty(e.detail.value)
													// generateKillerSudoku(e.detail.value, false)
												},
											})}
										>
											{['Keyboard', 'Touch'].map((v, i) => {
												return (
													<saki-menu-item
														key={i}
														active={inputMode === v}
														value={v}
														min-width='80px'
														padding={'8px 12px'}
													>
														<span
															style={{
																fontSize: '14px',
															}}
														>
															{t(v.toLowerCase() + 'Input', {
																ns: 'killerSudokuPage',
															})}
														</span>
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
						{problem.length ? (
							<div className='ks-h-r-pause'>
								<saki-button
									type='CircleIconGrayHover'
									ref={bindEvent({
										tap: () => {
											console.log('1111')
											if (isSolve || problem.length === 0) return
											setIsStart(!isStart)
										},
									})}
								>
									{isStart ? (
										<saki-icon
											width='16px'
											height='16px'
											type='Pause'
											color='#666'
										></saki-icon>
									) : (
										<saki-icon
											width='16px'
											height='16px'
											type='Play'
											color='#666'
										></saki-icon>
									)}
								</saki-button>
							</div>
						) : (
							''
						)}
						<div className='ks-h-r-more'>
							{mounted ? (
								<saki-dropdown
									visible={openMoreDropDownMenu}
									floating-direction='Left'
									ref={bindEvent({
										close: (e) => {
											setOpenMoreDropDownMenu(false)
										},
									})}
								>
									<div className='ks-d-m-button'>
										<saki-button
											type='CircleIconGrayHover'
											ref={bindEvent({
												tap: () => {
													setOpenMoreDropDownMenu(!openMenuDropDownMenu)
												},
											})}
										>
											<saki-icon
												width='16px'
												height='16px'
												color='#666'
												type='More'
											></saki-icon>
										</saki-button>
									</div>
									<div className='ks-d-m-list' slot='main'>
										<saki-menu
											ref={bindEvent({
												selectvalue: async (e) => {
													setOpenMoreDropDownMenu(false)
													switch (e.detail.value) {
														case 'NewGame':
															generateKillerSudoku(difficulty, false)
															break
														case 'Solve':
															solveSudoku()
															break
														case 'Share':
															await share()
															break

														default:
															break
													}
												},
											})}
										>
											{['NewGame', 'Solve', 'Share'].map((v, i) => {
												if (
													!problem.length &&
													(v === 'NewGame' || v === 'Solve')
												) {
													return ''
												}
												return (
													<saki-menu-item
														key={i}
														value={v}
														min-width='80px'
														padding={'8px 12px'}
													>
														<span
															style={{
																fontSize: '14px',
															}}
														>
															{t(v.toLowerCase(), {
																ns:
																	v === 'Share' ? 'prompt' : 'killerSudokuPage',
															})}
														</span>
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
				</div>
				<div
					className={'ks-main ' + config.appearance + ' ' + config.deviceType}
				>
					<div
						style={
							{
								'--width': sudokuWidth + 'px',
								// (config.window.width <= 768
								// 	? config.window.width <= 500
								// 		? config.window.width - 20
								// 		: config.window.width - 200
							} as any
						}
						className='killer-sudoku '
					>
						{new Array(81).fill(0).map((_, i) => {
							const ksIndex = i

							const row = Math.floor(ksIndex / 9) + 1
							const col = (ksIndex % 9) + 1
							const ksItem = problem.filter((ksv) => {
								return ksv.list.filter((kssv) => {
									if (kssv.col === col && kssv.row === row) {
										// console.log(kssv)
										return kssv
									}
									return false
								})?.length
							})
							if (!ksItem.length) {
								return (
									<div
										key={i}
										className={'ks-item-none '}
										onClick={() => {
											// console.log(row, col)

											if (isSolve > 0) return
											setSelectedGrid({
												row,
												col,
											})
										}}
									></div>
								)
							}

							// console.log(
							// 	'ksItem',
							// 	row,
							// 	col,
							// 	ksItem?.[0].list,
							// 	ksIndex,
							// 	ksItem
							// )
							let cNameArr: string[] = []
							let minIndex = (row - 1) * 9 + col - 1
							let val = 0
							ksItem?.[0].list.forEach((v) => {
								// console.log('ksItem', ksItem, v)
								if (v.col === col && v.row === row && v.val) {
									val = v.val
								}
								if (minIndex > (v.row - 1) * 9 + v.col - 1) {
									minIndex = (v.row - 1) * 9 + v.col - 1
								}
								if (v.col === col) {
									// console.log(row, v.row)
									if (row === v.row + 1) {
										// top
										!cNameArr.includes('top') && cNameArr.push('top')
									}
									if (row === v.row - 1) {
										!cNameArr.includes('bottom') && cNameArr.push('bottom')
									}
								}
								if (v.row === row) {
									// console.log(row, v.row)
									if (col === v.col + 1) {
										// top
										!cNameArr.includes('left') && cNameArr.push('left')
									}
									if (col === v.col - 1) {
										!cNameArr.includes('right') && cNameArr.push('right')
									}
								}
								// if (v.col === col) {
								// 	if (col > v.col) {
								// 		// left
								// 		!cNameArr.includes('left') && cNameArr.push('left')
								// 	} else {
								// 		// right
								// 		!cNameArr.includes('right') && cNameArr.push('right')
								// 	}
								// }
							})
							// cellAdjacentDirection.current[ksIndex] = cNameArr
							// Right bottom

							const answerItem = answer.filter((ssv) => {
								return ssv.col === col && ssv.row === row
							})?.[0]

							// console.log(answerItem)
							// console.log('val', val, ksItem)
							return (
								<div
									key={i}
									data-sum={isStart ? ksItem[0]?.val : ''}
									className={
										'ks-item-wrap ' +
										(selectedGrid.row === row && selectedGrid.col === col
											? 'selected '
											: '') +
										(answerItem?.val === inputNum && inputNum
											? 'highlight '
											: '') +
										(val > 0 ? 'filled ' : '') +
										(errorSudoku[0].includes(row) ? 'errorRow ' : '') +
										(errorSudoku[1].includes(col) ? 'errorCol ' : '') +
										(errorSudoku[2].includes(
											sudoku.getPalace((row - 1) * 9 + col - 1, row)
										)
											? 'errorPalace '
											: '') +
										(errorSudoku[3].includes((row - 1) * 9 + col - 1)
											? 'errorIndex '
											: '') +
										(ksItem?.[0].list.length >= 4 &&
										isFourCellAdjacent(ksItem?.[0].list)
											? 'fourCellAdjacent '
											: '') +
										// (selectedGrid.row === row ? 'selectedRow ' : '') +
										// (selectedGrid.col === col ? 'selectedCol ' : '') +
										// (sudoku.getPalace(
										// 	(selectedGrid.row - 1) * 9 + selectedGrid.col - 1,
										// 	selectedGrid.row
										// ) === sudoku.getPalace((row - 1) * 9 + col - 1, row)
										// 	? 'selectedPalace '
										// 	: '') +
										// (answerItem?.error ? 'error  ' : '') +
										(minIndex === (row - 1) * 9 + col - 1 ? 'first ' : '') +
										cNameArr.join(' ') +
										(isStart ? '' : ' hide')
									}
									onClick={() => {
										console.log(row, col, isOpenErase, inputMode, inputNum)

										if (isSolve > 0) return
										setSelectedGrid({
											row,
											col,
										})
										if (isOpenErase) {
											eraseNumber(row, col)
											return
										}

										fillNumber(row, col, inputNum)
									}}
								>
									<div
										// style={{
										// 	...(ksItem[0]?.list.length === 1
										// 		? { color: '#000' }
										// 		: {}),
										// }}
										className='ks-item-val'
									>
										{isStart && (val || answerItem?.val)
											? val || answerItem?.val
											: ''}
									</div>

									<div className='ks-item-notes'>
										{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v, i) => {
											const isExist = answerItem?.notes?.includes(v)

											return (
												<span
													className={
														(isExist && v === inputNum ? 'highlight ' : '') +
														(!isExist ? 'hide' : '')
													}
													key={v}
												>
													{isStart ? v : ''}
												</span>
											)
										})}
									</div>
								</div>
							)
						})}

						{!isStart && problem.length && mounted ? (
							<div
								onClick={() => {
									if (isSolve || problem.length === 0) return
									setIsStart(true)
								}}
								className='ks-pause'
							>
								<saki-icon
									width={baseSudokuWidth * 40 + 'px'}
									height={baseSudokuWidth * 40 + 'px'}
									color='#fff'
									type='Play'
								></saki-icon>
							</div>
						) : (
							''
						)}
						{!problem.length && mounted ? (
							<div className='ks-new'>
								<saki-dropdown
									visible={openNewGameDropDownMenu}
									floating-direction='Center'
									ref={bindEvent({
										close: (e) => {
											setOpenNewGameDropDownMenu(false)
										},
									})}
								>
									<div className='ks-new-button'>
										<saki-button
											width='200px'
											height='50px'
											color='#fff'
											border-radius='4px'
											bg-color='var(--ksudoku-button-bg-color)'
											bg-hover-color='var(--ksudoku-button-bg-hover-color)'
											bg-active-color='var(--ksudoku-button-bg-active-color)'
											// width={baseSudokuWidth * 200 + 'px'}
											// height={baseSudokuWidth * 50 + 'px'}
											ref={bindEvent({
												tap: async () => {
													const isOldData = await checkGameOldData()
													console.log(isOldData)
													if (isOldData) {
														alert({
															title: t('savedGame', {
																ns: 'prompt',
															}),
															content: t('savedGameContent', {
																ns: 'prompt',
															}).replace(
																'${difficulty}',
																t(difficulty.toLowerCase(), {
																	ns: 'killerSudokuPage',
																})
															),
															cancelText: t('no', {
																ns: 'prompt',
															}),
															confirmText: t('yes', {
																ns: 'prompt',
															}),
															async onCancel() {
																setIsRestoreGame(true)
                                setOpenNewGameDropDownMenu(true)
																await dispatch(
																	methods.game.deleteGame('KillerSudoku')
																)
															},
															async onConfirm() {
																await restoreGame()
															},
                            }).open()
                            return
													}

													setIsRestoreGame(true)
													setOpenNewGameDropDownMenu(true)
												},
											})}
										>
											<span
											// style={{
											// 	fontSize: baseSudokuWidth * 14 + 'px',
											// }}
											>
												{t('playNewGame')}
											</span>
										</saki-button>
									</div>
									<div className='ks-new-list' slot='main'>
										<saki-menu
											ref={bindEvent({
												selectvalue: async (e) => {
													setOpenNewGameDropDownMenu(false)

													setDifficulty(e.detail.value)

													generateKillerSudoku(
														e.detail.value,
														problem.length === 0
													)
												},
											})}
										>
											{['Easy', 'Moderate', 'Hard', 'Extreme'].map((v, i) => {
												return (
													<saki-menu-item
														key={i}
														value={v}
														min-width='80px'
														padding={'8px 12px'}
													>
														<span
															style={{
																fontSize: '14px',
															}}
														>
															{t(v.toLowerCase(), {
																ns: 'killerSudokuPage',
															})}
														</span>
													</saki-menu-item>
												)
											})}
										</saki-menu>
									</div>
								</saki-dropdown>
							</div>
						) : (
							''
						)}
					</div>
					<div
						style={
							{
								// fontSize:
								// 	(config.window.width > 880 ? 880 : config.window.width) *
								// 		0.397 +
								// 	'px',
								'--width': inputWidth + 'px',
							} as any
						}
						className={'killer-input ' + config.deviceType}
					>
						<div className='ki-wrap'>
							{[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Pen', 'Erase', 'Undo'].map(
								(v, i) => {
									return (
										<div
											key={i}
											className={
												'k-i-item ' +
												((typeof v === 'string' && v === 'Pen' && isOpenNote) ||
												(typeof v === 'string' &&
													v === 'Erase' &&
													isOpenErase) ||
												inputNum === v
													? 'active '
													: '')
											}
										>
											<saki-button
												bg-color={
													(typeof v === 'string' &&
														v === 'Pen' &&
														isOpenNote) ||
													(typeof v === 'string' &&
														v === 'Erase' &&
														isOpenErase) ||
													inputNum === v
														? 'var(--ksudoku-input-button-bg-color)'
														: '#f6f6f6'
												}
												bg-hover-color={
													(typeof v === 'string' &&
														v === 'Pen' &&
														isOpenNote) ||
													(typeof v === 'string' &&
														v === 'Erase' &&
														isOpenErase) ||
													inputNum === v
														? 'var(--ksudoku-input-button-bg-hover-color)'
														: '#eee'
												}
												bg-active-color={
													(typeof v === 'string' &&
														v === 'Pen' &&
														isOpenNote) ||
													(typeof v === 'string' &&
														v === 'Erase' &&
														isOpenErase) ||
													inputNum === v
														? 'var(--ksudoku-input-button-bg-active-color)'
														: '#e1e1e1'
												}
												border={
													(typeof v === 'string' &&
														v === 'Pen' &&
														isOpenNote) ||
													(typeof v === 'string' &&
														v === 'Erase' &&
														isOpenErase) ||
													inputNum === v
														? '2px solid var(--ksudoku-input-button-border-color)'
														: '2px solid transparent'
												}
												width={
													config.deviceType === 'Mobile'
														? inputWidth / 6 - inputWidth * 0.002873 * 10 + 'px'
														: 'calc(var(--width) *  0.3)'
												}
												height={
													config.deviceType === 'Mobile'
														? inputWidth / 6 - inputWidth * 0.002873 * 10 + 'px'
														: 'calc(var(--width) *  0.3)'
												}
												border-radius='6px'
												ref={bindEvent({
													tap: () => {
														if (isSolve > 0) return
														if (typeof v === 'number') {
															setIsOpenErase(false)
															if (inputMode === 'Touch') {
																setInputNum(v)
															} else {
																fillNumber(
																	selectedGrid.row,
																	selectedGrid.col,
																	v
																)
															}
															return
														}
														switch (v) {
															case 'Erase':
																setInputNum(0)
																setIsOpenNote(false)
																if (inputMode === 'Touch') {
																	setIsOpenErase(!isOpenErase)
																} else {
																	eraseNumber(
																		selectedGrid.row,
																		selectedGrid.col
																	)
																}

																break
															case 'Pen':
																setIsOpenErase(false)
																if (isOpenNote) {
																}
																setIsOpenNote(!isOpenNote)

																break

															case 'Undo':
																setIsOpenNote(false)
																setIsOpenErase(false)
																setSelectedGrid({
																	row: -1,
																	col: -1,
																})
																if (history.length) {
																	const hisItem = history[history.length - 1]
																	let ans = [...answer]
																	switch (hisItem.type) {
																		case 'Add':
																			ans = ans.filter((v) => {
																				return !(
																					v.row === hisItem.answerItem.row &&
																					v.col === hisItem.answerItem.col
																				)
																			})
																			break
																		case 'Update':
																			ans = ans.map((v) => {
																				if (
																					v.row === hisItem.answerItem.row &&
																					v.col === hisItem.answerItem.col
																				) {
																					return {
																						...hisItem.answerItem,
																					}
																				}
																				return { ...v }
																			})
																			break
																		case 'Erase':
																			ans = ans.concat([hisItem.answerItem])
																			break

																		default:
																			break
																	}
																	setAnswer(ans)
																	// setAnswer()
																	setHistory(
																		history.filter(
																			(_, i) => i !== history.length - 1
																		)
																	)
																}

																break

															default:
																break
														}
													},
												})}
											>
												{typeof v === 'number' ? (
													<span>{v}</span>
												) : (
													<saki-icon
														width={
															// (config.window.width > 880
															// 	? 880
															// 	: config.window.width) *
															// 	0.397 *
															// 	0.1142 +
															// 'px'
															config.window.width > 880
																? 880 * 0.397 * 0.1142 + 'px'
																: config.deviceType === 'Mobile'
																? inputWidth * 0.07 + 'px'
																: config.window.width * 0.397 * 0.1142 + 'px'
														}
														height={
															// (config.window.width > 880
															// 	? 880
															// 	: config.window.width) *
															// 	0.397 *
															// 	0.1142 +
															// 'px'

															config.window.width > 880
																? 880 * 0.397 * 0.1142 + 'px'
																: config.deviceType === 'Mobile'
																? inputWidth * 0.07 + 'px'
																: config.window.width * 0.397 * 0.1142 + 'px'
														}
														type={v}
														color='var(--ksudoku-input-number-color)'
													></saki-icon>
												)}
											</saki-button>
										</div>
									)
								}
							)}
						</div>
						{problem.length ? (
							<div className='ki-numbers'>
								{new Array(8)
									.fill(0)
									.map((v, i) => {
										return problem.filter((v) => v.list.length === i + 1).length
									})
									.filter((v, i) => (i > 5 ? v : true))
									.map((v, i, arr) => {
										return i === arr.length - 1 ? v : v + '-'
									})}
							</div>
						) : (
							''
						)}
						{/* <div className='ki-buttons'>
              a
            </div> */}
					</div>
				</div>

				<div className='ks-introduce'>
					<h1>
						{t('aboutSudoku', {
							ns: 'killerSudokuPage',
						})}
					</h1>

					<div className='ks-i-content'>
						<p>
							{t('aboutSudokuContent1', {
								ns: 'killerSudokuPage',
							})}
						</p>
						<p>
							{t('aboutSudokuContent2', {
								ns: 'killerSudokuPage',
							})}
						</p>
					</div>

					<h1>
						{t('sudokuGameRule', {
							ns: 'killerSudokuPage',
						})}
					</h1>
					<div className='ks-i-content'>
						<p>
							{t('sudokuGameRuleContent1', {
								ns: 'killerSudokuPage',
							})}
						</p>
						<p>
							{t('sudokuGameRuleContent2', {
								ns: 'killerSudokuPage',
							})}
						</p>
						<p>
							{t('sudokuGameRuleContent3', {
								ns: 'killerSudokuPage',
							})}
						</p>
					</div>

					<h1>
						{t('aboutKillerSudoku', {
							ns: 'killerSudokuPage',
						})}
					</h1>

					<div className='ks-i-content'>
						<p>
							{t('aboutKillerSudokuContent1', {
								ns: 'killerSudokuPage',
							})}
						</p>
					</div>

					<h1>
						{t('killerSudokuRule', {
							ns: 'killerSudokuPage',
						})}
					</h1>

					<div className='ks-i-content'>
						<p>
							{t('killerSudokuRuleContent1', {
								ns: 'killerSudokuPage',
							})}
						</p>
						<p>
							{t('killerSudokuRuleContent2', {
								ns: 'killerSudokuPage',
							})}
						</p>
						<br />
						<p>
							{t('killerSudokuRuleContent3', {
								ns: 'killerSudokuPage',
							})}
						</p>
						<h3>
							{t('killerSudokuRuleContent4', {
								ns: 'killerSudokuPage',
							}).replace('${number}', '2')}
						</h3>
						<ul>
							<li>3 = 1+2</li>
							<li>4 = 1+3</li>
							<li>16 = 7+9</li>
							<li>17 = 8+9</li>
						</ul>
						<h3>
							{t('killerSudokuRuleContent4', {
								ns: 'killerSudokuPage',
							}).replace('${number}', '3')}
						</h3>
						<ul>
							<li>6 = 1+2+3</li>
							<li>7 = 1+2+4</li>
							<li>23 = 6+8+9</li>
							<li>24 = 7+8+9</li>
						</ul>
						<h3>
							{t('killerSudokuRuleContent4', {
								ns: 'killerSudokuPage',
							}).replace('${number}', '4')}
						</h3>
						<ul>
							<li>10 = 1+2+3+4</li>
							<li>11 = 1+2+3+5</li>
							<li>29 = 5+7+8+9</li>
							<li>30 = 6+7+8+9</li>
						</ul>
						<h3>
							{t('killerSudokuRuleContent4', {
								ns: 'killerSudokuPage',
							}).replace('${number}', '5')}
						</h3>
						<ul>
							<li>15 = 1+2+3+4+5</li>
							<li>16 = 1+2+3+4+6</li>
							<li>34 = 4+6+7+8+9</li>
							<li>35 = 5+6+7+8+9</li>
						</ul>
						<h3>
							{t('killerSudokuRuleContent4', {
								ns: 'killerSudokuPage',
							}).replace('${number}', '6')}
						</h3>
						<ul>
							<li>21 = 1+2+3+4+5+6</li>
							<li>22 = 1+2+3+4+5+7</li>
							<li>38 = 3+5+6+7+8+9</li>
							<li>39 = 4+5+6+7+8+9</li>
						</ul>

						<br />
						<p>
							{t('killerSudokuRuleContent5', {
								ns: 'killerSudokuPage',
							})}
						</p>
					</div>

					<div className='ks-i-content'>
						<p>
							{t('welcomeToPlay', {
								ns: 'killerSudokuPage',
							})}
						</p>
						<p>
							<ruby>
								一期一会
								<rt>いちごいちえ</rt>~
							</ruby>
						</p>
					</div>

					<p
						style={{
							color: '#aaa',
							textAlign: 'right',
							fontSize: '12px',
						}}
					>
						<em>
							(
							{t('fromWiki', {
								ns: 'killerSudokuPage',
							})}
							)
						</em>
					</p>
				</div>

				<div className='ks-footer'></div>
				<FooterComponent></FooterComponent>
			</div>
		</>
	)
}
KillerSudokuPage.getLayout = function getLayout(page: any) {
	return <IndexLayout>{page}</IndexLayout>
}

export default KillerSudokuPage
