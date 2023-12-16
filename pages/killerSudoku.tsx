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
import { deepCopy, NyaNyaWasm, QueueLoop, userAgent } from '@nyanyajs/utils'
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

var dlx1 = require('dlx')

const KillerSudokuPage = () => {
	const { t, i18n } = useTranslation('killerSudokuPage')
	const [mounted, setMounted] = useState(false)
	const config = useSelector((state: RootState) => state.config)
	const api = useSelector((state: RootState) => state.api)

	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [openMenuDropDownMenu, setOpenMenuDropDownMenu] = useState(false)
	const [openInputModeDropDown, setOpenInputModeDropDown] = useState(false)
	const [openMoreDropDownMenu, setOpenMoreDropDownMenu] = useState(false)
	const [isStart, setIsStart] = useState(false)
	const [isSolve, setIsSolve] = useState<0 | 1 | 2>(0)
	const [isOpenNote, setIsOpenNote] = useState(false)
	const [isOpenErase, setIsOpenErase] = useState(false)
	const [inputNum, setInputNum] = useState(0)
	const [time, setTime] = useState(0)
	const [inputMode, setInputMode] = useState<'Keyboard' | 'Touch'>('Keyboard')
	const [difficulty, setDifficulty] = useState<SudokuDifficulty | ''>('')
	// const cellAdjacentDirection = useRef<string[][]>([])
	const timer = useRef<NodeJS.Timeout>()
	const [sudokuList, setsudokuList] = useState<number[][]>([])

	const [answer, setAnswer] = useState<
		{
			row: number
			col: number
			val: number
			notes?: number[]
			// errorVal: boolean
			// errorRow: boolean
			// errorCol: boolean
			// errorPalace: boolean
		}[]
	>([
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

	const [history, setHistory] = useState<(typeof answer)[]>([])
	// 1 row / 2 col / 3 palace / 4 index
	const [errorSudoku, setErrorSudoku] = useState<number[][]>([[], [], [], []])

	const [selectedGrid, setSelectedGrid] = useState({
		row: -1,
		col: -1,
	})

	const [killerSudokuDiff, setKillerSudokuDiff] =
		useState<SudokuDifficulty>('Easy')
	const [killerSudoku, setKillerSudoku] = useState<
		{
			type: 'Sum'
			val: number
			list: {
				row: number
				col: number
				val?: number
			}[]
		}[]
	>([])

	const dispatch = useDispatch<AppDispatch>()

	useEffect(() => {
		if (!config.loadStatus.sakiUI || !router.isReady) return
		const diff = ['Easy', 'Moderate', 'Hard', 'Extreme'].includes(
			String(router.query.d)
		)
			? (String(router.query.d) as any)
			: 'Easy'
		console.log(diff, difficulty)
		if (diff === difficulty) return
		setDifficulty(diff)

		generateKillerSudoku(diff, killerSudoku.length === 0)
	}, [router.query.d, config.loadStatus.sakiUI])

	useEffect(() => {
		setMounted(true)
		// console.log('userAgent', )
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
	}, [isStart, time])

	useEffect(() => {
		window.onkeyup = keyUpEvent
		// window.removeEventListener('keyup', keyUpEvent)
		// window.addEventListener('keyup', keyUpEvent)
	}, [selectedGrid.row, selectedGrid.col, answer, history, isOpenNote])

	useEffect(() => {
		dispatch(layoutSlice.actions.setLayoutHeaderLogoText(t('pageTitle')))
	}, [i18n.language])

	// useEffect(() => {
	// }, [answer.length])

	useEffect(() => {
		console.log(isSolve)
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
					setIsOpenErase(false)
					setIsOpenNote(false)
					setInputNum(0)
					setSelectedGrid({
						row: -1,
						col: -1,
					})
					setErrorSudoku([[], [], [], []])
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
					// if (window.Worker) {
					//   console.log(window.Worker)
					//   const myWorker = new Worker('/sudokuWorker.js') // 创建worker

					//   myWorker.addEventListener('message', (e) => {
					//     // 接收消息
					//     console.log('message=> ', e.data) // Greeting from Worker.js，worker线程发送的消息
					//   })

					//   myWorker.postMessage('Greeting from Main.js')
					// }
					console.time('killerSudoku.generateProblem')
					let getSudoku = [
						3, 7, 5, 4, 6, 1, 2, 8, 9, 1, 9, 4, 8, 2, 7, 6, 5, 3, 2, 8, 6, 3, 5,
						9, 4, 1, 7, 4, 2, 3, 5, 7, 8, 1, 9, 6, 7, 5, 1, 9, 4, 6, 3, 2, 8, 8,
						6, 9, 2, 1, 3, 7, 4, 5, 9, 1, 7, 6, 8, 2, 5, 3, 4, 6, 4, 8, 1, 3, 5,
						9, 7, 2, 5, 3, 2, 7, 9, 4, 8, 6, 1,
					]
					getSudoku = []
					const generateProblem = sudoku.killerSudoku.generateProblem(
						getSudoku,
						difficulty
					)
					console.log('generateProblem', generateProblem)

					// const generateProblem: ReturnType<
					// 	typeof sudoku.killerSudoku.generateProblem
					// > = JSON.parse(
					// 	'{"problem":[{"type":"Sum","val":14,"list":[{"row":1,"col":1,"val":0},{"row":2,"col":1,"val":1},{"row":3,"col":1,"val":0}]},{"type":"Sum","val":10,"list":[{"row":1,"col":2,"val":2},{"row":1,"col":3,"val":0}]},{"type":"Sum","val":12,"list":[{"row":1,"col":4,"val":0},{"row":1,"col":5,"val":0},{"row":2,"col":5,"val":8}]},{"type":"Sum","val":14,"list":[{"row":1,"col":6,"val":0},{"row":1,"col":7,"val":5}]},{"type":"Sum","val":7,"list":[{"row":1,"col":8,"val":0},{"row":2,"col":8,"val":0}]},{"type":"Sum","val":15,"list":[{"row":1,"col":9,"val":0},{"row":2,"col":9,"val":7},{"row":3,"col":9,"val":0}]},{"type":"Sum","val":8,"list":[{"row":2,"col":3,"val":5},{"row":3,"col":3,"val":0}]},{"type":"Sum","val":2,"list":[{"row":2,"col":4,"val":2}]},{"type":"Sum","val":17,"list":[{"row":2,"col":6,"val":6},{"row":3,"col":6,"val":0},{"row":4,"col":6,"val":7}]},{"type":"Sum","val":8,"list":[{"row":3,"col":8,"val":0}]},{"type":"Sum","val":14,"list":[{"row":4,"col":3,"val":0},{"row":4,"col":4,"val":0},{"row":5,"col":4,"val":4}]},{"type":"Sum","val":15,"list":[{"row":4,"col":8,"val":1},{"row":4,"col":9,"val":0},{"row":5,"col":9,"val":0}]},{"type":"Sum","val":8,"list":[{"row":5,"col":2,"val":0},{"row":5,"col":3,"val":1}]},{"type":"Sum","val":15,"list":[{"row":5,"col":7,"val":0},{"row":5,"col":8,"val":0},{"row":6,"col":8,"val":0}]},{"type":"Sum","val":17,"list":[{"row":6,"col":2,"val":0},{"row":7,"col":2,"val":6},{"row":8,"col":2,"val":8}]},{"type":"Sum","val":19,"list":[{"row":6,"col":3,"val":0},{"row":7,"col":3,"val":0},{"row":8,"col":3,"val":4}]},{"type":"Sum","val":6,"list":[{"row":6,"col":4,"val":0},{"row":7,"col":4,"val":0}]},{"type":"Sum","val":13,"list":[{"row":6,"col":9,"val":8},{"row":7,"col":9,"val":4},{"row":8,"col":9,"val":0}]},{"type":"Sum","val":8,"list":[{"row":7,"col":1,"val":0},{"row":8,"col":1,"val":0}]},{"type":"Sum","val":3,"list":[{"row":9,"col":1,"val":2},{"row":9,"col":2,"val":0}]},{"type":"Sum","val":17,"list":[{"row":9,"col":3,"val":0},{"row":9,"col":4,"val":0},{"row":9,"col":5,"val":0}]},{"type":"Sum","val":13,"list":[{"row":9,"col":6,"val":5},{"row":9,"col":7,"val":8}]},{"type":"Sum","val":21,"list":[{"row":7,"col":5,"val":3},{"row":8,"col":5,"val":0},{"row":8,"col":6,"val":0},{"row":8,"col":4,"val":0}]},{"type":"Sum","val":19,"list":[{"row":7,"col":8,"val":0},{"row":8,"col":8,"val":5},{"row":9,"col":8,"val":0},{"row":9,"col":9,"val":0}]},{"type":"Sum","val":15,"list":[{"row":5,"col":5,"val":9},{"row":6,"col":5,"val":0},{"row":6,"col":6,"val":1},{"row":5,"col":6,"val":0}]},{"type":"Sum","val":18,"list":[{"row":3,"col":4,"val":0},{"row":3,"col":5,"val":0},{"row":4,"col":5,"val":6}]},{"type":"Sum","val":17,"list":[{"row":5,"col":1,"val":0},{"row":6,"col":1,"val":0}]},{"type":"Sum","val":4,"list":[{"row":3,"col":7,"val":0},{"row":4,"col":7,"val":3}]},{"type":"Sum","val":9,"list":[{"row":2,"col":7,"val":0}]},{"type":"Sum","val":25,"list":[{"row":6,"col":7,"val":4},{"row":7,"col":7,"val":0},{"row":8,"col":7,"val":0},{"row":7,"col":6,"val":0}]},{"type":"Sum","val":18,"list":[{"row":2,"col":2,"val":0},{"row":3,"col":2,"val":0},{"row":4,"col":2,"val":0}]},{"type":"Sum","val":4,"list":[{"row":4,"col":1,"val":0}]}],"difficulty":"Easy","solution":[7,2,8,3,1,9,5,4,6,1,4,5,2,8,6,9,3,7,6,9,3,7,5,4,1,8,2,4,5,2,8,6,7,3,1,9,8,7,1,4,9,3,2,6,5,9,3,6,5,2,1,4,7,8,5,6,9,1,3,8,7,2,4,3,8,4,9,7,2,6,5,1,2,1,7,6,4,5,8,9,3]}'
					// )

					setKillerSudoku(generateProblem.problem)
					setKillerSudokuDiff(generateProblem.difficulty)

					for (let i = 1; i < 8; i++) {
						console.log(
							'' +
								i +
								'个格子的数量：' +
								generateProblem.problem.filter((v) => v.list.length === i)
									.length
						)
					}

					const ans: typeof answer = []
					let sol = sudoku.killerSudoku.solve(
						generateProblem.problem.map((v) => {
							return {
								type: 'Sum',
								val: v.val,
								list: v.list.map((v) => {
									ans.push({
										row: v.row,
										col: v.col,
										val: generateProblem.solution[(v.row - 1) * 9 + v.col - 1],
									})
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

					console.log('solve', sol)
					setIsStart(true)
					setIsSolve(0)
					setIsOpenNote(false)
					setIsOpenErase(false)
					setInputNum(0)

					setSelectedGrid({
						row: -1,
						col: -1,
					})
					setErrorSudoku([[], [], [], []])
					setTime(0)

					setAnswer(
						[]
						// JSON.parse(
						// 	'[{"row":1,"col":6,"val":9,"notes":[]},{"row":1,"col":3,"val":8,"notes":[]},{"row":3,"col":3,"val":3,"notes":[]},{"row":3,"col":7,"val":1,"notes":[]},{"row":2,"col":7,"val":9,"notes":[]},{"row":3,"col":8,"val":8,"notes":[]},{"row":9,"col":2,"val":1,"notes":[]},{"row":6,"col":2,"val":3,"notes":[]},{"row":5,"col":2,"val":7,"notes":[]},{"row":6,"col":1,"val":9,"notes":[]},{"row":5,"col":1,"val":8,"notes":[]},{"row":4,"col":1,"val":4,"notes":[]},{"row":7,"col":4,"val":1,"notes":[]},{"row":6,"col":4,"val":5,"notes":[]},{"row":7,"col":3,"val":9,"notes":[]},{"row":6,"col":3,"val":6,"notes":[]},{"row":8,"col":1,"val":3,"notes":[]},{"row":7,"col":1,"val":5,"notes":[]},{"row":3,"col":1,"val":6,"notes":[]},{"row":1,"col":1,"val":7,"notes":[]},{"row":1,"col":5,"val":1,"notes":[]},{"row":1,"col":4,"val":3,"notes":[]},{"row":2,"col":8,"val":3,"notes":[]},{"row":1,"col":8,"val":4,"notes":[]},{"row":1,"col":9,"val":6,"notes":[]},{"row":3,"col":9,"val":2,"notes":[]},{"row":8,"col":9,"val":1,"notes":[]},{"row":9,"col":9,"val":3,"notes":[]},{"row":2,"col":2,"val":4,"notes":[]},{"row":3,"col":2,"val":9,"notes":[]},{"row":3,"col":6,"val":4,"notes":[]},{"row":3,"col":5,"val":5,"notes":[]},{"row":3,"col":4,"val":7,"notes":[]},{"row":4,"col":2,"val":5,"notes":[]},{"row":4,"col":3,"val":2,"notes":[]},{"row":4,"col":4,"val":8,"notes":[]},{"row":4,"col":9,"val":9,"notes":[]},{"row":5,"col":9,"val":5,"notes":[]},{"row":6,"col":8,"val":7,"notes":[]},{"row":9,"col":3,"val":7,"notes":[]},{"row":9,"col":5,"val":4,"notes":[]},{"row":9,"col":4,"val":6,"notes":[]},{"row":9,"col":8,"val":9,"notes":[]},{"row":7,"col":8,"val":2,"notes":[]},{"row":5,"col":7,"val":2,"notes":[]},{"row":5,"col":8,"val":6,"notes":[]},{"row":5,"col":6,"val":3,"notes":[]},{"row":6,"col":5,"val":2,"notes":[]},{"row":8,"col":5,"val":7,"notes":[]},{"row":8,"col":6,"val":2,"notes":[]},{"row":8,"col":4,"val":9,"notes":[]},{"row":8,"col":7,"val":6,"notes":[]},{"row":7,"col":7,"val":7,"notes":[]}]'
						// )
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
					tipText: '正在生成中',
				})
			}, 300)
			timer && clearInterval(timer)
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
			killerSudoku.some((v) => {
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

			setHistory(history.concat([deepCopy(answer)]))
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
			} else {
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
			console.log(ans, checkAnswer(ans))
			if (checkAnswer(ans)) {
				isSolveFunc(ans)
			}
			setAnswer(ans)
		}
	}

	const eraseNumber = (row: number, col: number) => {
		if (isSolve > 0) return

		let index = -1
		const ans = [
			...answer.filter((v, i) => {
				if (v.col == col && v.row == row) {
					index = i
				}
				return !(v.col == col && v.row == row)
			}),
		]

		if (index < 0) {
			return
		}
		setHistory(history.concat([answer]))

		checkAnswer(ans)
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
				let sol = sudoku.killerSudoku.solve(
					killerSudoku.map((v) => {
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
				setIsSolve(1)
				setIsOpenErase(false)
				setIsOpenNote(false)

				setInputNum(0)
				setSelectedGrid({
					row: -1,
					col: -1,
				})
				setErrorSudoku([[], [], [], []])
				setAnswer(ans)
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
			errorSudoku.reduce(
				(pv, cv) => pv + cv.reduce((pv, cv) => pv + cv, 0),
				0
			) === 0
		)
	}

	const isSolveFunc = (ansList: typeof answer) => {
		if (
			errorSudoku.reduce(
				(pv, cv) => pv + cv.reduce((pv, cv) => pv + cv, 0),
				0
			) !== 0
		)
			return
		const answer = [...ansList]

		killerSudoku.forEach((v) => {
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
						'[' +
						t(difficulty.toLowerCase(), {
							ns: 'killerSudokuPage',
						}) +
						']' +
						' - ' +
						t('appTitle', {
							ns: 'common',
						})}
				</title>
				<link
					rel='stylesheet'
					href='https://unpkg.com/leaflet@1.9.3/dist/leaflet.css'
					integrity='sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI='
					crossOrigin=''
				/>
				<script
					src='https://unpkg.com/leaflet@1.9.3/dist/leaflet.js'
					integrity='sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM='
					crossOrigin=''
				></script>
			</Head>
			<div className={'killer-sudoku-page ' + config.deviceType}>
				<div className='ks-header'>
					<div className='ks-difficulty'>
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

													router.replace(
														Query('/killerSudoku', {
															...router.query,
															d: e.detail.value,
														})
													)
												},
											})}
										>
											{['Easy', 'Moderate', 'Hard', 'Extreme'].map((v, i) => {
												return (
													<saki-menu-item
														key={i}
														padding='0'
														active={v === difficulty}
														value={v}
													>
														<div className='ks-d-l-item'>
															{t(v.toLowerCase(), {
																ns: 'killerSudokuPage',
															})}
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
														padding='0'
														active={inputMode === v}
														value={v}
													>
														<div className='inputMode-l-item'>
															{t(v.toLowerCase() + 'Input', {
																ns: 'killerSudokuPage',
															})}
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
						<div className='ks-h-r-pause'>
							<saki-button
								type='CircleIconGrayHover'
								ref={bindEvent({
									tap: () => {
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
															await window.navigator.clipboard.writeText(
																location.href
															)

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
															break

														default:
															break
													}
												},
											})}
										>
											{['NewGame', 'Solve', 'Share'].map((v, i) => {
												return (
													<saki-menu-item key={i} padding='0' value={v}>
														<div className='ks-d-l-item'>
															{t(v.toLowerCase(), {
																ns:
																	v === 'Share' ? 'prompt' : 'killerSudokuPage',
															})}
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
							const ksItem = killerSudoku.filter((ksv) => {
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
										console.log(row, col, inputMode, inputNum)

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

						{!isStart && killerSudoku.length ? (
							<div className='ks-pause'>
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
										<div key={i} className='k-i-item'>
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
												border-radius='10%'
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
																if (history.length) {
																	checkAnswer(history[history.length - 1])
																	setAnswer(history[history.length - 1])
																	setHistory(
																		history.filter(
																			(_, i) => i !== history.length - 1
																		)
																	)
																	setSelectedGrid({
																		row: -1,
																		col: -1,
																	})
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
						{killerSudoku.length ? (
							<div className='ki-numbers'>
								{new Array(8)
									.fill(0)
									.map((v, i) => {
										return killerSudoku.filter((v) => v.list.length === i + 1)
											.length
									})
									.filter((v, i) => (i > 5 ? v : true))
									.map((v, i, arr) => {
										return i === arr.length - 1 ? v : v + '-'
									})}
							</div>
						) : (
							''
						)}
					</div>
				</div>
				{/* {sudokuList.map((v, vi) => {
					return (
						<div key={vi} className='sudoku'>
							{v.map((v, i) => {
								return (
									<div
										key={i}
										className={
											'sudoku-item ' +
											(sudokuProblem[i] === v ? 'exist ' : 'new ')
										}
									>
										{v}
									</div>
								)
							})}
						</div>
					)
				})} */}

				<div
					style={{
						margin: '50px 0 0',
					}}
				></div>
				<FooterComponent></FooterComponent>
			</div>
		</>
	)
}
KillerSudokuPage.getLayout = function getLayout(page: any) {
	return <IndexLayout>{page}</IndexLayout>
}

export default KillerSudokuPage
