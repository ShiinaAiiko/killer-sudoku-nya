import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import { getI18n } from 'react-i18next'
import store, { ActionParams, RootState } from '.'

import { Languages, languages, defaultLanguage } from '../plugins/i18n/i18n'
import { storage } from './storage'
import { SudokuDifficulty } from '../plugins/sudoku'

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
}

export const gameMethods = {
	saveGame: createAsyncThunk(
		'game/saveGame',
		async (
			val: {
				key: string
				data: any
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
export type DeviceType = 'Mobile' | 'Pad' | 'PC'
export type LanguageType = Languages | 'system'
export let deviceType: DeviceType | undefined

export const language: LanguageType = defaultLanguage as any
export const appearances = ['Pink', 'Blue']
export const appearanceColors = {
	Pink: '#f29cb2',
	Blue: '#3393ce',
}

const state = {}
export const gameSlice = createSlice({
	name: 'game',
	initialState: state,
	reducers: {
		setSakiUILoadStatus: (
			state,
			params: {
				payload: boolean
				type: string
			}
		) => {},
	},
})
