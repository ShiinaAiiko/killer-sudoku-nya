import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

function IndexPage(props: any) {
	const router = useRouter()
	useEffect(() => {
		router.replace('/killerSudoku')
	}, [])

	return <div></div>
}
export default IndexPage
