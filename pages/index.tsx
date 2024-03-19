import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { isInPwa } from '../plugins/methods'
import { storage } from '../store/storage'

function IndexPage(props: any) {
	const router = useRouter()
	useEffect(() => {
		if (isInPwa()) {
      const init = async () => {
        console.log(await storage.global.get('pathname'))
				router.replace(
					(await storage.global.get('pathname')) || '/killerSudoku'
				)
			}
			init()
		} else {
			router.replace('/killerSudoku')
		}
	}, [])

	return <div></div>
}
export default IndexPage
