import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import { getI18n } from 'react-i18next'
import store, { ActionParams, RootState, methods } from '.'

import { Languages, languages, defaultLanguage } from '../plugins/i18n/i18n'
import { storage } from './storage'
import { SudokuDifficulty } from '../plugins/sudoku'
import killerSudoku from '../plugins/killerSudoku'

import { WebWorker } from '@nyanyajs/utils'

export interface KillerSudokuProblemItem {
	type: 'Sum'
	val: number
	list: {
		row: number
		col: number
		val?: number
	}[]
}
export interface KillerSudokuHistoryAnswerItem {
	type: 'Add' | 'Update' | 'Erase'
	answerItem: KillerSudokuAnswerItem
}

export interface KillerSudokuAnswerItem {
	row: number
	col: number
	val: number
	notes?: number[]
	// true 则是默认答案
	default: boolean
	// errorVal: boolean
	// errorRow: boolean
	// errorCol: boolean
	// errorPalace: boolean
}

export interface KillerSudokuData {
	problem: KillerSudokuProblemItem[]
	answer: KillerSudokuAnswerItem[]
	history: KillerSudokuHistoryAnswerItem[]
	difficulty: SudokuDifficulty
	time: number
	id: string
}

export interface StorageKillerSudokuItem {
	id: string
	problem: any[]
	time: number
	// 0 未完成 1 完成
	status: 0 | 1
	difficulty: SudokuDifficulty
}

const state = {
	// -1 | 0 | 1
	generateKillerSudokuStatus: -1,
}
export const gameSlice = createSlice({
	name: 'game',
	initialState: state,
	reducers: {
		setGenerateKillerSudokuStatus: (
			state,
			params: {
				payload: (typeof state)['generateKillerSudokuStatus']
				type: string
			}
		) => {
			state.generateKillerSudokuStatus = params.payload
		},
	},
})
let worker: WebWorker<'KillerSudokuGenerateProblem' | 'KillerSudokuSolve'>

const generateKillerSudokuProblem = async (difficulty: SudokuDifficulty) => {
	worker = new WebWorker<'KillerSudokuGenerateProblem' | 'KillerSudokuSolve'>(
		'/webworker-bundle.js'
	)

	const problem = await worker.postMessage<
		ReturnType<typeof killerSudoku.generateProblem>
	>('KillerSudokuGenerateProblem', {
		sudoku: [],
		difficulty: difficulty,
		// options: {
		// 	log: false,
		// },
	})

	return problem
}

export const gameMethods = {
	initKillerSudoku: createAsyncThunk(
		'game/initKillerSudoku',
		async (_, thunkAPI) => {
			const { config } = store.getState()
			const diff = ['Easy', 'Moderate', 'Hard', 'Extreme']

			const promiseAll: any[] = []

			for (let i = 0; i < diff.length; i++) {
				const difficulty = diff[i] as SudokuDifficulty
				promiseAll.push(
					new Promise(async (resolve, reject) => {
						const res = await storage.global.get(
							'killerSudokuBackupProblem_' + difficulty
						)

						if (res?.problem && res?.buildTime === config.buildTime) {
							resolve(1)
							return
						}

						thunkAPI.dispatch(
							gameSlice.actions.setGenerateKillerSudokuStatus(0)
						)

						console.time('generateKillerSudokuProblem' + difficulty)
						const problem = await generateKillerSudokuProblem(difficulty)

						storage.global.set('killerSudokuBackupProblem_' + difficulty, {
							buildTime: config.buildTime,
							problem,
						})
						console.timeEnd('generateKillerSudokuProblem' + difficulty)
						resolve(1)
					})
				)
			}

			await Promise.all(promiseAll)
			worker?.terminate()

			thunkAPI.dispatch(gameSlice.actions.setGenerateKillerSudokuStatus(1))
		}
	),
	getKillerSudoku: createAsyncThunk(
		'game/getKillerSudoku',
		async (difficulty: SudokuDifficulty, thunkAPI) => {
			const { config } = store.getState()

			const res = await storage.global.get(
				'killerSudokuBackupProblem_' + difficulty
			)
			// console.log(
			// 	'getKillerSudoku',
			// 	res,
			// 	difficulty,

			// 	res?.problem &&
			// 		res?.problem?.difficulty === difficulty &&
			// 		res?.buildTime === config.buildTime
			// )

			if (
				!(
					res?.problem &&
					res?.problem?.difficulty === difficulty &&
					res?.buildTime === config.buildTime
				)
			) {
				// await thunkAPI.dispatch(methods.game.initKillerSudoku())

				const problem = await generateKillerSudokuProblem(difficulty)

				storage.global
					.delete('killerSudokuBackupProblem_' + difficulty)
					.then(async (res) => {
						await thunkAPI.dispatch(methods.game.initKillerSudoku())
					})
				// console.log(problem)
				return problem
			}

			storage.global
				.delete('killerSudokuBackupProblem_' + difficulty)
				.then(async (res) => {
					await thunkAPI.dispatch(methods.game.initKillerSudoku())
				})

			return res.problem as ReturnType<typeof killerSudoku.generateProblem>
		}
	),
	saveGame: createAsyncThunk(
		'game/saveGame',
		async (
			val: {
				key: string
				data: KillerSudokuData
			},
			thunkAPI
		) => {
			await storage.global.set('game_' + val.key, val.data)
		}
	),
	restoreGame: createAsyncThunk(
		'game/restoreGame',
		async (key: string, thunkAPI) => {
			const gameData = await storage.global.get('game_' + key)
			if (!gameData) {
				return undefined
			}
			return gameData
		}
	),
	deleteGame: createAsyncThunk(
		'game/deleteGame',
		async (key: string, thunkAPI) => {
			await storage.global.delete('game_' + key)
		}
	),
	checkGameOldData: createAsyncThunk(
		'game/checkGameOldData',
		async (key: string, thunkAPI) => {
			const gameData = await storage.global.get('game_' + key)

			return !!gameData
		}
	),
}
