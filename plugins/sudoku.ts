import dlx from './dlx'
import killerSudoku from './killerSudoku'

export interface DlxRowValItem {
	val: number
	row: number
	col: number
	palace: number
}

export type SudokuDifficulty = 'Easy' | 'Moderate' | 'Hard' | 'Extreme'

export const random = (min: number, max: number): number => {
	var newMin = min || 0
	var newMax = max || 10
	return min !== undefined && max !== undefined
		? Math.floor(Math.random() * (newMax - newMin) + newMin)
		: Math.floor(Math.random() * 10)
}

export const general = (): number[] => {
	let sudokuProblem: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
	for (let i = sudokuProblem.length - 1; i >= 0; i--) {
		let randomIndex = Math.floor(Math.random() * (i + 1))
		let temp = sudokuProblem[randomIndex]
		sudokuProblem[randomIndex] = sudokuProblem[i]
		sudokuProblem[i] = temp
	}

	for (let i = 0; i < 8; i++) {
		const rowArr = generalRowData(sudokuProblem)
		sudokuProblem = sudokuProblem.concat(rowArr)
	}

	if (sudokuProblem.length < 81) {
		return general()
	}

	return sudokuProblem
}

const generalRowData = (sudokuProblem: number[]): number[] => {
	const sudokuPRCData = getSudokuPRCData(sudokuProblem)
	// console.log(sudokuPRCData)
	const sudokuRowValList: DlxRowValItem[] = []
	let sudokuLinkList: number[][] = []

	// sudokuProblem.forEach((v, i) => {
	// 	const row = Math.floor(i / 9) + 1
	// 	const col = (i % 9) + 1
	// 	// fillGeneralSudokuLinkList(sudokuLinkList, sudokuRowValList, row, col, v)
	// })

	for (let i = 0; i < 9; i++) {
		const row = Math.floor((sudokuProblem.length + i) / 9) + 1
		const col = ((sudokuProblem.length + i) % 9) + 1
		const palace = getPalace(sudokuProblem.length + i, row)

		// console.log(row, col, palace)
		!sudokuPRCData[0][palace] && (sudokuPRCData[0][palace] = [])

		for (let j = 1; j < 10; j++) {
			// 1、同一个宫格不能一样
			// 2、同一个列不能一样
			if (
				!sudokuPRCData[0][palace].includes(j) &&
				!sudokuPRCData[2][col - 1].includes(j)
			) {
				fillGeneralSudokuLinkList(
					sudokuLinkList,
					sudokuRowValList,
					row,
					col,
					palace,
					j
				)
				// console.log(j)
				// fillLinkList(sudokuLinkList, sudokuRowValList, row, col, j)
			}
		}
	}
	// console.log('sudokuLinkList', sudokuLinkList)
	const dlxSolve = dlx.solve(sudokuLinkList)
	// console.log('自己的 dlx.solve', sudokuLinkList, sudokuProblem, dlxSolve)
	if (!dlxSolve.length) {
		return []
	}
	return dlxSolve[random(0, dlxSolve.length)].map((sv) => {
		return sudokuRowValList[sv].val
	})
}

export const solve = (sudokuProblem: number[]) => {
	sudokuProblem = [...sudokuProblem]
	// let sudokuLinkList = new Array(81 * 9).fill(new Array(324).fill(0))
	let sudokuLinkList: number[][] = []

	const sudokuRowValList: DlxRowValItem[] = []

	const sudokuPRCData = getSudokuPRCData(sudokuProblem)
	// console.log('sudokuPRCData', sudokuPRCData)

	sudokuProblem.forEach((v, i) => {
		const row = Math.floor(i / 9) + 1
		const col = (i % 9) + 1
		const palace = getPalace(i, row) + 1

		if (v) {
			fillSolveSudokuLinkList(
				sudokuLinkList,
				sudokuRowValList,
				row,
				col,
				palace,
				v
			)
			return
		}

		for (let j = 1; j < 10; j++) {
			// 先得出3个条件的9个子数组包含哪些数字先
			// 1、检测九宫格哪些数字可以填写
			// 2、检测这一行哪些数字可以填写
			// 3、检测这一列哪些数字可以填写
			// 求三个条件的交集，算出这个格子可以填哪些数字

			if (
				!sudokuPRCData[0][palace - 1].includes(j) &&
				!sudokuPRCData[1][row - 1].includes(j) &&
				!sudokuPRCData[2][col - 1].includes(j)
			) {
				fillSolveSudokuLinkList(
					sudokuLinkList,
					sudokuRowValList,
					row,
					col,
					palace,
					j
				)
			}
		}
	})
	// console.log('sudokuLinkList', sudokuLinkList, sudokuRowValList)
	// console.log('sudokuRowValList', sudokuRowValList)
	// sudokuLinkList = sudokuLinkList.filter((v) => {
	// 	return v.reduce((x, y) => x + y, 0)
	// })

	// console.time('别人的 dlx.solve')
	// const ans11 = dlx1.solve(sudokuLinkList).map((v: number[]) => {
	// 	v.sort((a, b) => {
	// 		return a - b
	// 	})
	// 	return v
	// })
	// console.timeEnd('别人的 dlx.solve')
	// console.time('我的 dlx.solve')
	const dlxSolve = dlx.solve(sudokuLinkList)
	// console.timeEnd('我的 dlx.solve')

	// console.log('别人的 dlx.solve', ans11)
	// console.log('自己的 dlx.solve', dlxSolve)
	const ans = dlxSolve.map((v: number[]) => {
		return v.map((sv) => {
			return sudokuRowValList[sv].val
		})
	})
	// console.log('别人的 dlx.solve', dlx1.solve(sudokuLinkList))

	return ans
}

const fillGeneralSudokuLinkList = (
	sudokuLinkList: number[][],
	sudokuRowValList: DlxRowValItem[],
	row: number,
	col: number,
	palace: number,
	val: number
) => {
	const rowArr: number[] = new Array(18).fill(0)
	rowArr[col - 1] = 1
	rowArr[val - 1 + 9] = 1

	sudokuRowValList.push({
		val,
		row,
		col,
		palace,
	})
	sudokuLinkList.push(rowArr)
}

const fillSolveSudokuLinkList = (
	sudokuLinkList: number[][],
	sudokuRowValList: DlxRowValItem[],
	row: number,
	col: number,
	palace: number,
	val: number
) => {
	// console.log(val)

	if (val) {
		const rowArr: number[] = new Array(324).fill(0)
		// for (let j = 0; j < 324; j++) {
		// 	rowArr[i].push(0)
		// }
		// const ri = (row - 1) * 9 * 9 + (col - 1) * 9 + val
		// sudokuLinkList[ri - 1][(row - 1) * 9 + col - 1] = 1
		// sudokuLinkList[ri - 1][(row - 1) * 9 + val + 81 - 1] = 1
		// sudokuLinkList[ri - 1][(col - 1) * 9 + val + 162 - 1] = 1
		// sudokuLinkList[ri - 1][(row - 1) * 9 + val + 243 - 1] = 1
		rowArr[(row - 1) * 9 + col - 1] = 1
		rowArr[(row - 1) * 9 + val + 81 - 1] = 1
		rowArr[(col - 1) * 9 + val + 162 - 1] = 1
		rowArr[(palace - 1) * 9 + val + 243 - 1] = 1

		sudokuRowValList.push({
			val,
			row,
			col,
			palace,
		})
		sudokuLinkList.push(rowArr)
	}
}

const getSudokuPRCData = (sudokuProblem: number[]): number[][][] => {
	const limit: number[][][] = [[], [], []]
	for (let i = 0; i < sudokuProblem.length; i++) {
		// console.log(sudokuProblem[i])
		const val = sudokuProblem[i]
		// console.log(9 * (i - 1), 9 * (i - 1) + 3, i)
		const row = Math.floor(i / 9) + 1
		const col = (i % 9) + 1
		// 1、九宫格
		const palace = getPalace(i, row)

		!limit[0][palace] && (limit[0][palace] = [])
		val && limit[0][palace].push(val)
		// if (9 * (row - 1) <= i && 9 * (row - 1) + 3 > i && sudokuProblem[i]) {

		// }
		// 2、每一行
		!limit[1][row - 1] && (limit[1][row - 1] = [])
		val && limit[1][row - 1].push(val)
		// 3、每一列
		!limit[2][col - 1] && (limit[2][col - 1] = [])
		val && limit[2][col - 1].push(val)
	}
	return limit
}

export const getPalace = (i: number, row: number) => {
	return Math.floor((i - 9 * (row - 1)) / 3) + Math.floor(i / 27) * 3
}

export const generateProblem = (sudoku: number[], removeNum: number = 40) => {
	// 每随机删除一个数字，就要检测下有几个答案

	sudoku = [...sudoku]
	// const sudokuArr = sudoku
	// for (let i = 0; i < 90; i++) {
	// 	const sIndex = random(0, 81)
	// 	let temp = sudoku[sIndex]
	// 	sudoku[sIndex] = 0
	// 	const ans = solve(sudoku)
	// 	console.log('solve', i, ans)
	// 	if (ans.length >= 2) {
	// 		sudoku[sIndex] = temp
	// 	}
	// }

	let runCount = 0
	do {
		const sIndex = random(0, 81)
		let temp = sudoku[sIndex]
		const row = Math.floor(sIndex / 9) + 1
		const col = (sIndex % 9) + 1
		const palace = getPalace(sIndex, row) + 1
		const prcData = getSudokuPRCData(sudoku)
		// console.log(prcData)
		try {
			runCount++
			if (
				prcData[0][palace - 1].length <= 1 ||
				prcData[1][row - 1].length <= 1 ||
				prcData[2][col - 1].length <= 1
			) {
				continue
			}

			sudoku[sIndex] = 0
			const ans = solve(sudoku)

			if (ans.length >= 2) {
				sudoku[sIndex] = temp
			}
		} catch (error) {
			console.error(error, prcData)
		}
	} while (sudoku.filter((v) => v > 0).length > removeNum && runCount < 300)

	console.log('计算次数已超过', runCount, '次, 结束')
	console.log(
		'目标删除',
		removeNum,
		'个数字, 剩余填了数字的格子：',
		sudoku.filter((v) => v > 0).length,
		sudoku
	)

	return sudoku
}

export const sudoku = {
	general,
	solve,
	generateProblem,
	// killerSudoku: killerSudoku,
	getPalace,
}

export default sudoku
