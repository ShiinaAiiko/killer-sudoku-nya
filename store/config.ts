import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import { getI18n } from 'react-i18next'
import store, { ActionParams } from '.'

import i18n, {
	Languages,
	changeLanguage,
	defaultLanguage,
	detectionLanguage,
} from '../plugins/i18n/i18n'
import { storage } from './storage'
import { appListUrl, buildTime, version } from '../config'
import axios from 'axios'
import { isInPwa } from '../plugins/methods'

export type DeviceType = 'Mobile' | 'Pad' | 'PC'
export type LanguageType = Languages | 'system'
export let deviceType: DeviceType | undefined

export const language: LanguageType = defaultLanguage as any
export const languages = ['system'].concat(i18n.languages)
export const appearances = ['Pink', 'Blue']
export const appearanceColors = {
	Pink: '#f29cb2',
	Blue: '#3393ce',
}

const state = {
	version: version,
	buildTime: buildTime,
	language: language,
	defaultLanguage: defaultLanguage,
	lang: '',
	languages,
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
	appList: [] as {
		title: {
			[lang: string]: string
		}
		url: string
	}[],
}
export const configSlice = createSlice({
	name: 'config',
	initialState: state,
	reducers: {
		setAppList: (
			state,
			params: {
				payload: (typeof state)['appList']
				type: string
			}
		) => {
			state.appList = params.payload
		},
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
			storage.global.setSync('appearance', params.payload)
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
export const configMethods = {
	init: createAsyncThunk('config/init', async (_, thunkAPI) => {
		// const language = (await storage.global.get('language')) || 'system'
		// thunkAPI.dispatch(configMethods.setLanguage(language))

		thunkAPI.dispatch(
			configSlice.actions.setAppearance(
				(await storage.global.get('appearance')) || 'Pink'
			)
		)
		thunkAPI.dispatch(configMethods.getDeviceType())

		const res = await axios({
			method: 'GET',
			url: appListUrl,
		})
		res?.data?.appList &&
			thunkAPI.dispatch(configSlice.actions.setAppList(res.data.appList))
	}),
	setLanguage: createAsyncThunk(
		'config/setLanguage',
		async (language: LanguageType, thunkAPI) => {
			thunkAPI.dispatch(configSlice.actions.setLanguage(language))

			console.log(language)
			// console.log(
			//   'isInPwa',
			//   isInPwa(),
			// )
			if (language === 'system') {
				changeLanguage(detectionLanguage() as any)
			} else {
				changeLanguage(language)
			}

			store.dispatch(configSlice.actions.setLang(getI18n().language))

			console.log('language', language)

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
