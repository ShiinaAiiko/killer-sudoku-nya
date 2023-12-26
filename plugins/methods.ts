import React, { useEffect, useState } from 'react'
import qs from 'qs'
import { RootState } from '../store'

import { useSelector, useStore, useDispatch } from 'react-redux'

import axios, { AxiosRequestConfig } from 'axios'

import store, { userSlice } from '../store'

export const getRegExp = (type: 'email') => {
	return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
}

export const copyText = (text: string) => {
	if (window.isSecureContext && navigator.clipboard) {
		navigator.clipboard.writeText(text)
	} else {
		const textArea = document.createElement('textarea')
		textArea.value = text
		document.body.appendChild(textArea)
		textArea.focus()
		textArea.select()
		try {
			document.execCommand('copy')
		} catch (err) {
			console.error('Unable to copy to clipboard', err)
		}
		document.body.removeChild(textArea)
	}
}

export const random = (min: number, max: number) => {
	var newMin = min || 0
	var newMax = max || 10
	return min !== undefined && max !== undefined
		? String(Math.floor(Math.random() * (newMax - newMin) + newMin))
		: String(Math.floor(Math.random() * 10))
}
export const getRandomPassword = (
	num: number = 0,
	include: ('Number' | 'Character')[]
) => {
	let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
	let number = '0123456789'
	let character = '#$%&()*+,-.:;<=>?@[]^_{|}~'

	let randStr = '' + alphabet

	if (include.includes('Number')) {
		randStr += number
	}
	if (include.includes('Character')) {
		randStr += character
	}

	let randNum = Number(random(0, alphabet.length - 1))
	let str = randStr.substring(randNum, randNum + 1)

	for (let i = 1; i < num; i++) {
		randNum = Number(random(0, randStr.length - 1))
		str += randStr.substring(randNum, randNum + 1)
	}
	return str
}
export const Query = (
	url: string,
	query: {
		[k: string]: string
	}
) => {
	let obj: {
		[k: string]: string
	} = {}
	let o = Object.assign(obj, query)
	let s = qs.stringify(
		Object.keys(o).reduce(
			(fin, cur) => (o[cur] !== '' ? { ...fin, [cur]: o[cur] } : fin),
			{}
		)
	)
	return url + (s ? '?' + s : '')
}
export const GetTime = (timestamp: number) => {
	const h = Math.floor(timestamp / 3600) % 24
	const m = Math.floor(timestamp / 60) % 60
	const s = Math.floor(timestamp % 60)
	return h + 'h ' + m + 'm ' + s + 's'
}
