import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import { getI18n } from 'react-i18next'
import store, { ActionParams } from '.'

import { Languages, languages, defaultLanguage } from '../plugins/i18n/i18n'
import { storage } from './storage'
export const configMethods = {
	init: createAsyncThunk('config/init', async (_, thunkAPI) => {
		// const language = (await storage.global.get('language')) || 'system'
		// thunkAPI.dispatch(configMethods.setLanguage(language))

		thunkAPI.dispatch(configMethods.getDeviceType())
	}),
	setLanguage: createAsyncThunk(
		'config/setLanguage',
		async (language: LanguageType, thunkAPI) => {
			thunkAPI.dispatch(configSlice.actions.setLanguage(language))

			// console.log('navigator.language', language, navigator.language)
			if (language === 'system') {
				const languages = ['zh-CN', 'zh-TW', 'en-US']
				if (languages.indexOf(navigator.language) >= 0) {
					getI18n().changeLanguage(navigator.language)
				} else {
					switch (navigator.language.substring(0, 2)) {
						case 'zh':
							getI18n().changeLanguage('zh-CN')
							break
						case 'en':
							getI18n().changeLanguage('en-US')
							break

						default:
							getI18n().changeLanguage('en-US')
							break
					}
				}
			} else {
				getI18n().changeLanguage(language)
			}

			store.dispatch(configSlice.actions.setLang(getI18n().language))

			await storage.global.set('language', language)
		}
	),
	getDeviceType: createAsyncThunk('config/getDeviceType', (_, thunkAPI) => {
		thunkAPI.dispatch(
			configSlice.actions.setWindowWH({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		)

		if (document.body.offsetWidth <= 768) {
			thunkAPI.dispatch(configSlice.actions.setDeviceType('Mobile'))
			return
		}
		if (document.body.offsetWidth <= 1024 && document.body.offsetWidth > 768) {
			thunkAPI.dispatch(configSlice.actions.setDeviceType('Pad'))
			return
		}
		thunkAPI.dispatch(configSlice.actions.setDeviceType('PC'))
	}),
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

const state = {
	language: language,
	lang: '',
	languages: ['system', ...languages],
	deviceType,
	loadStatus: {
		sakiUI: false,
	},
	window: {
		width: 0,
		height: 0,
	},
	appearances,
	appearance: 'Pink' as 'Pink' | 'Blue',
}
export const configSlice = createSlice({
	name: 'config',
	initialState: state,
	reducers: {
		setSakiUILoadStatus: (
			state,
			params: {
				payload: boolean
				type: string
			}
		) => {
			state.loadStatus.sakiUI = params.payload
		},
		setAppearance: (
			state,
			params: {
				payload: (typeof state)['appearance']
				type: string
			}
		) => {
			state.appearance = params.payload
		},
		setLanguage: (
			state,
			params: {
				payload: LanguageType
				type: string
			}
		) => {
			state.language = params.payload
		},
		setWindowWH: (
			state,
			params: {
				payload: {
					width: (typeof state)['window']['width']
					height: (typeof state)['window']['height']
				}
				type: string
			}
		) => {
			state.window.width = params.payload.width
			state.window.height = params.payload.height
		},
		setLang: (
			state,
			params: {
				payload: string
				type: string
			}
		) => {
			state.lang = params.payload
		},
		setDeviceType: (state, params: ActionParams<DeviceType>) => {
			state.deviceType = params.payload
		},
	},
})
