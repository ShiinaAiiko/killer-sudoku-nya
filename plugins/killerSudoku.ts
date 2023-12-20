import {
	getPalace,
	DlxRowValItem,
	SudokuDifficulty,
	random,
	general,
} from './sudoku'
import dlx from './dlx'

export interface KillerSudokuProblemItem {
	type: 'Sum'
	val: number
	list: {
		row: number
		col: number
		// 确定为0
		// 不确定为>0
		val?: number
	}[]
}

export const solve = (
	sudokuProblem: KillerSudokuProblemItem[],
	options?: {
		maxSolutionCount: number
	}
) => {
	// console.log('sudokuProblem', sudokuProblem)

	let sudokuLinkList: number[][] = []
	const sudokuRowValList: DlxRowValItem[] = []

	let currentIndex = 0
	sudokuProblem.forEach((v) => {
		// const numbers = []

		// let sumArrs = []
		let sumArrsTemp: number[][] = getAllAnswersForSum(v.list.length, v.val)

		// console.log(sumArrsTemp)
		// for (let i = 1; i <= 9; i++) {
		// 	if (v.list.length === 1 && i === v.val) {
		// 		// console.log(v, i)
		// 		// numbers.push(i)
		// 		// sumArrs.push([i])
		// 		sumArrsTemp.push([i])
		// 	}
		// 	if (v.list.length >= 2) {
		// 		for (let j = 1; j <= 9; j++) {
		// 			// 2个数字
		// 			if (i + j === v.val && v.list.length === 2 && i < j) {
		// 				sumArrsTemp.push([i, j])
		// 			}
		// 			// if (i + j === v.val && v.list.length === 2 && i != j) {
		// 			// 	// console.log(v, i, j, i + j)
		// 			// 	!numbers.includes(i) && numbers.push(i)
		// 			// 	sumArrs.push([i, j])
		// 			// }
		// 			// 3个数字
		// 			if (v.list.length >= 3) {
		// 				for (let a = 1; a <= 9; a++) {
		// 					if (
		// 						i + j + a === v.val &&
		// 						v.list.length === 3 &&
		// 						i < j &&
		// 						j < a
		// 					) {
		// 						sumArrsTemp.push([i, j, a])
		// 					}
		// 					// if (
		// 					// 	i + j + a === v.val &&
		// 					// 	v.list.length === 3 &&
		// 					// 	killerSudoku.isEqual(v, [i, j, a, 0, 0])
		// 					// ) {
		// 					// 	// console.log(
		// 					// 	// 	'isEqual',
		// 					// 	// 	killerSudoku.isEqual(v, i, j, a, 0, 0),
		// 					// 	// 	i,
		// 					// 	// 	j,
		// 					// 	// 	a
		// 					// 	// )
		// 					// 	// console.log(i, j, a, i + j + a)
		// 					// 	!numbers.includes(i) && numbers.push(i)
		// 					// 	sumArrs.push([i, j, a])
		// 					// }

		// 					// 4个数字
		// 					if (v.list.length >= 4) {
		// 						for (let b = 1; b <= 9; b++) {
		// 							if (
		// 								i + j + a + b === v.val &&
		// 								v.list.length === 4 &&
		// 								i < j &&
		// 								j < a &&
		// 								a < b
		// 							) {
		// 								sumArrsTemp.push([i, j, a, b])
		// 							}
		// 							// if (
		// 							// 	i + j + a + b === v.val &&
		// 							// 	v.list.length === 4 &&
		// 							// 	killerSudoku.isEqual(v, [i, j, a, b, 0])
		// 							// ) {
		// 							// 	!numbers.includes(i) && numbers.push(i)
		// 							// 	sumArrs.push([i, j, a, b])
		// 							// 	// console.log(i, j, a, b, i + j + a + b)
		// 							// }
		// 							// 5个数字
		// 							if (v.list.length >= 5) {
		// 								for (let c = 1; c <= 9; c++) {
		// 									if (
		// 										i + j + a + b + c === v.val &&
		// 										v.list.length === 5 &&
		// 										i < j &&
		// 										j < a &&
		// 										a < b &&
		// 										b < c
		// 									) {
		// 										sumArrsTemp.push([i, j, a, b, c])
		// 									}
		// 									// if (
		// 									// 	i + j + a + b + c === v.val &&
		// 									// 	v.list.length === 5 &&
		// 									// 	killerSudoku.isEqual(v, [i, j, a, b, c])
		// 									// ) {
		// 									// 	!numbers.includes(i) && numbers.push(i)

		// 									// 	sumArrs.push([i, j, a, b, c])
		// 									// }
		// 								}
		// 							}
		// 						}
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// }

		// rowArr
		// rowArr.push()

		let sumArrsTempArr: {
			[sum: number]: number[]
		} = {}

		v.list.forEach((pos) => {
			if (pos.val) {
				sumArrsTemp = sumArrsTemp.filter((sv) => {
					return sv.includes(pos?.val || 0)
				})
			}
		})
		sumArrsTemp.forEach((v) => {
			v.forEach((sv, si) => {
				const sum = v.reduce((pv, cv, ci) => {
					return si > ci ? pv + cv : pv
				}, 0)
				!sumArrsTempArr[sum] && (sumArrsTempArr[sum] = [])
				!sumArrsTempArr[sum].includes(sv) && sumArrsTempArr[sum].push(sv)
			})
		})

		// console.log('sumArrsTempArr', sumArrsTempArr)
		const tempIndex = sudokuLinkList.length

		const sudokuSum = sudokuProblem.reduce((pv, cv) => {
			return pv + cv.val
		}, 0)

		let rowCount = 324
		rowCount = 324 + sudokuSum

		v.list.forEach((pos) => {
			// if (pos.val) {
			// 	const rowArr: number[] = new Array(rowCount).fill(0)

			// 	if (rowCount === 324 + sudokuSum) {
			// 		// console.log(324 + currentIndex + Number(sum), Number(sum), val)
			// 		for (let i = 0; i < pos.val; i++) {
			// 			// sudokuRowValList
			// 			// console.log(currentIndex, ssvIndex)
			// 			rowArr[324 + currentIndex + Number(sum) + i] = 1
			// 		}
			// 	}
			// 	return
			// }
			Object.keys(sumArrsTempArr).forEach((sum) => {
				// rowArr[324 + currentIndex + ssvIndex] = 1
				// console.log(324 + currentIndex + Number(sum))

				sumArrsTempArr[Number(sum)].forEach((val) => {
					if (pos.val && pos.val !== val) return
					const rowArr: number[] = new Array(rowCount).fill(0)

					if (rowCount === 324 + sudokuSum) {
						// console.log(324 + currentIndex + Number(sum), Number(sum), val)
						for (let i = 0; i < val; i++) {
							// sudokuRowValList
							// console.log(currentIndex, ssvIndex)
							rowArr[324 + currentIndex + Number(sum) + i] = 1
						}
					}

					const row = pos.row
					const col = pos.col
					const palace = getPalace((row - 1) * 9 + col - 1, row)

					// console.log(row, col, palace, val, palace * 9 + val + 243 - 1)

					rowArr[(row - 1) * 9 + col - 1] = 1
					rowArr[(row - 1) * 9 + val + 81 - 1] = 1
					rowArr[(col - 1) * 9 + val + 162 - 1] = 1
					rowArr[palace * 9 + val + 243 - 1] = 1
					// if ((row - 1) * 9 + val + 81 - 1 === 116) {
					// console.log(
					// 	'rowArr',
					// 	Number(sum),
					// 	val,
					// 	v,
					// 	{
					// 		row: row,
					// 		col: col,
					// 		val: val,
					// 		palace: palace,
					// 	},
					// 	rowArr
					// )
					// }
					sudokuLinkList.push(rowArr)
					sudokuRowValList.push({
						row: row,
						col: col,
						val: val,
						palace: palace,
					})
				})
			})
		})

		// sumArrs.forEach((sv) => {
		// 	// console.log(sv)
		// 	let ssvIndex = 0

		// 	// sv.forEach((ssv, ssi) => {
		// 	// 	// console.log(v.list[ssi])
		// 	// 	let rowCount = 324
		// 	// 	rowCount = 324 + 405
		// 	// 	const rowArr: number[] = new Array(rowCount).fill(0)

		// 	// 	if (rowCount === 324 + 405) {
		// 	// 		for (let i = 0; i < ssv; i++) {
		// 	// 			// sudokuRowValList
		// 	// 			// console.log(currentIndex, ssvIndex)
		// 	// 			rowArr[324 + currentIndex + ssvIndex] = 1
		// 	// 			ssvIndex += 1
		// 	// 		}
		// 	// 	}

		// 	// 	const pos = v.list[ssi]

		// 	// 	const row = pos.row
		// 	// 	const col = pos.col
		// 	// 	const val = ssv
		// 	// 	const palace = getPalace((row - 1) * 9 + col - 1, row)

		// 	// 	// console.log(row, col, palace, val, palace * 9 + val + 243 - 1)

		// 	// 	rowArr[(row - 1) * 9 + col - 1] = 1
		// 	// 	rowArr[(row - 1) * 9 + val + 81 - 1] = 1
		// 	// 	rowArr[(col - 1) * 9 + val + 162 - 1] = 1
		// 	// 	rowArr[palace * 9 + val + 243 - 1] = 1
		// 	// 	// if ((row - 1) * 9 + val + 81 - 1 === 116) {
		// 	// 	// 	console.log('rowArr', sv, v, rowArr, {
		// 	// 	// 		row: row,
		// 	// 	// 		col: col,
		// 	// 	// 		val: val,
		// 	// 	// 		palace: palace,
		// 	// 	// 	})
		// 	// 	// }
		// 	// 	sudokuLinkList.push(rowArr)
		// 	// 	sudokuRowValList.push({
		// 	// 		row: row,
		// 	// 		col: col,
		// 	// 		val: val,
		// 	// 		palace: palace,
		// 	// 	})
		// 	// })
		// 	// rowArr[sudokuLinkList.length + sv] = 1
		// 	// sudokuLinkList.push(rowArr)
		// })

		if (sumArrsTemp.length === 0) {
			console.log(
				'sumArrs',
				v,
				'sumArrsTemp',
				sumArrsTemp,
				sumArrsTempArr,
				sudokuLinkList.length - tempIndex
			)
			console.log('错误11111111111111111')
		}
		// console.log('sudokuLinkList', v, sumArrs, sudokuLinkList)
		currentIndex += v.val
		// console.log(numbers)

		const nums = []
		// console.log('numbers', v, v.list.length, numbers, sumArrs)
		// console.log('currentIndex', sudokuLinkList.length, currentIndex)
	})

	// console.log('sudokuLinkList', sudokuLinkList)
	// console.log('sudokuRowValList', sudokuRowValList)

	const dlxSolve = dlx.solve(sudokuLinkList, {
		maxSolutionCount: options?.maxSolutionCount,
		depthLimit: 81,
	})

	// dlx.solve(sudokuLinkList, {
	// 	maxSolutionCount: options?.maxSolutionCount,
	// 	depthLimit: 81,
	// 	algorithms: 'Recursion',
	// })
	// const dlxSolve1 = dlx1.solve(sudokuLinkList)

	// console.log('dlxSolve', dlxSolve)
	// console.log('dlxSolve1', dlxSolve1)

	// console.log(
	// 	sudokuProblem.reduce((pv, v) => {
	// 		return pv + v.val
	// 	}, 0)
	// )
	const ans = dlxSolve.map((v: number[]) => {
		const sudoku: number[] = new Array(81).fill(0)
		v.forEach((sv) => {
			sudoku[
				(sudokuRowValList[sv].row - 1) * 9 + sudokuRowValList[sv].col - 1
			] = sudokuRowValList[sv].val
		})

		return sudoku
	})
	return ans
}
export const generateProblem = (
	sudoku: number[],
	difficulty: SudokuDifficulty
): {
	problem: KillerSudokuProblemItem[]
	difficulty: SudokuDifficulty
	solution: number[]
} => {
	// console.log('sudoku', sudoku)
	if (sudoku.length < 81 && sudoku.length > 0) {
		console.error(
			'Sudoku array error, the length of the Sudoku array must be equal to 81, and an empty array is automatically generated.'
		)
		return {
			problem: [],
			difficulty,
			solution: [],
		}
	}

	if (sudoku.length === 0) {
		sudoku = general()
	}

	// generateKillerSudokuProblemFunc
	// generateProblemFunc
	let problem = generateKillerSudokuProblemFunc(
		sudoku,
		[],
		[],
		[],
		{
			row: 1,
			col: 1,
		},
		{
			level: 1,
			count: 0,
			userdIndex: {},
		}
	)

	let occupiedList: number[] = []
	problem.forEach((v) => {
		occupiedList = occupiedList.concat(
			v.list.map((sv) => {
				return (sv.row - 1) * 9 + sv.col - 1
			})
		)
	})
	// console.log('occupiedList', occupiedList.length)
	let ans1 = 0
	if (occupiedList.length < 81) {
		for (let i = 0; i < 81; i++) {
			if (!occupiedList.includes(i)) {
				ans1++
				problem.push({
					type: 'Sum',
					val: sudoku[i],
					list: [
						{
							row: Math.floor(i / 9) + 1,
							col: (i % 9) + 1,
						},
					],
				})
			}
		}
	}
	let singleCell = problem.filter((v) => v.list.length === 1)

	// console.log(
	// 	'answser',
	// 	occupiedList,
	// 	occupiedList.length,
	// 	problem,
	// 	ans1,
	// 	singleCell.length,
	// 	singleCell.length > 3
	// )

	//  暂时注解
	let singleCellNum = random(0, 3)
	// singleCellNum = singleCellNum - 3 < 0 ? 0 : singleCellNum - 3

	console.log('singleCell', singleCell.length, singleCellNum)
	if (singleCell.length > singleCellNum) {
		problem = mergeSingleCell(
			[
				...problem.map((v) => {
					return {
						...v,
						list: v.list.map((sv) => {
							return {
								...sv,
								val: sudoku[(sv.row - 1) * 9 + sv.col - 1],
							}
						}),
					}
				}),
			],
			{
				count: 1,
				singleCellNum,
			}
		).map((v) => {
			return {
				...v,
				list: v.list.map((sv) => {
					return {
						...sv,
						val: 0,
					}
				}),
			}
		})
		singleCell = problem.filter((v) => v.list.length === 1)
		if (singleCell.length >= 4) {
			console.log('单个格子数量超过了', singleCell.length)
			return generateProblem(sudoku, difficulty)
		}
		// 合并挨在一起的单个的并检测
		// return killerSudoku.generateProblem(sudoku)
	}
	// console.log(
	// 	'singleCellNum',
	// 	singleCellNum,
	// 	problem.filter((v) => v.list.length === 1)
	// )
	// console.log(
	// 	'answser',
	// 	answser.filter((v) => v.list.length === 1)
	// )

	let showNum = 0
	switch (difficulty) {
		case 'Easy':
			// 31
			showNum = 31
			break
		case 'Moderate':
			// 26
			showNum = 26
			break
		case 'Hard':
			// 10
			showNum = 10
			break
		case 'Extreme':
			showNum = 0
			// 0
			break

		default:
			break
	}
	const usedGrid: number[] = []
	for (let i = 0; i < showNum; i++) {
		// console.log(i)
		let gridIndex = -1
		do {
			gridIndex = random(0, 81)
		} while (usedGrid.includes(gridIndex))

		// console.log(gridIndex)

		problem.some((v) => {
			let isSkip = false
			v.list.some((sv) => {
				const row = Math.floor(gridIndex / 9) + 1
				const col = (gridIndex % 9) + 1
				if (sv.row === row && sv.col === col) {
					sv.val = sudoku[gridIndex]
					// console.log(sv)
					isSkip = true
					return isSkip
				}
			})
			return isSkip
		})
	}
	//  暂时注解

	let sol = solve(
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
		})
	)

	if (sol.length !== 1) {
		console.log('非唯一解，重新来', sol.length)
		return generateProblem(sudoku, difficulty)
	} else {
		console.log('唯一解', sol.length)
	}
	return {
		problem,
		difficulty,
		solution: sudoku,
	}
}

const mergeSingleCell = (
	problem: KillerSudokuProblemItem[],
	config: {
		count: number
		singleCellNum: number
	}
): {
	type: 'Sum'
	val: number
	list: {
		row: number
		col: number
	}[]
}[] => {
	if (config.count > 8) {
		console.error('mergesingleCell次数超出')
		return problem
	}
	config.count++
	const singleCell = problem.filter((v) => v.list.length === 1)

	// console.log('singleCell', config, singleCell.length)
	if (singleCell.length > config.singleCellNum) {
		// 1、先向周边List数量少的合并。
		const sgVal = singleCell[random(0, singleCell.length)]

		let row = sgVal.list[0].row
		let col = sgVal.list[0].col
		// console.log(random(0, 4))
		switch (random(0, 4)) {
			case 0:
				row = row - 1 < 1 ? row + 1 : row - 1
				break
			case 1:
				col = col + 1 > 9 ? col - 1 : col + 1
				break
			case 2:
				row = row + 1 > 9 ? row - 1 : row + 1
				break
			case 3:
				col = col - 1 < 1 ? col + 1 : col - 1
				break

			default:
				break
		}

		const nextAnswer = problem.filter((v) => {
			return v.list.filter((sv) => {
				return sv.row === row && sv.col === col
			}).length
		})
		// console.log('sgVal', sgVal, nextAnswser)
		if (nextAnswer.length >= 4) {
			return mergeSingleCell(problem, config)
		}

		nextAnswer[0]?.list.push(sgVal.list?.[0])
		nextAnswer[0].val = nextAnswer[0].val + sgVal.val

		problem = problem
			.filter((v) => {
				return !v.list.filter((sv) => {
					return (
						sv.row === sgVal.list?.[0].row && sv.col === sgVal.list?.[0].col
					)
				}).length
			})
			.concat(nextAnswer)
		// console.log('answser', answser)

		// console.time('killerSudoku.mergesingleCell')
		let isSkip = sumRule(nextAnswer[0]?.list as any)
		if (isSkip) {
			const answer = killerSudoku.solve(
				problem.map((v) => {
					return {
						type: v.type,
						val: v.val,
						list: v.list.map((sv) => {
							return {
								row: sv.row,
								col: sv.col,
								val: 0,
							}
						}),
					}
				})
			)
			isSkip = answer.length === 1
			// console.log('mergesingleCell.answer', answer.length)
		}
		// console.log(
		// 	'mergesingleCell.isSkip',
		// 	deepCopy(nextAnswer),
		// 	nextAnswer,
		// 	isSkip
		// )
		// console.timeEnd('killerSudoku.mergesingleCell')

		if (!isSkip) {
			nextAnswer[0].list = nextAnswer[0]?.list.filter((v) => {
				return !(v.row === sgVal.list?.[0].row && v.col === sgVal.list?.[0].col)
			})
			nextAnswer[0].val = nextAnswer[0].val - sgVal.val

			problem = problem.concat([sgVal])

			return mergeSingleCell(problem, config)
		}
		if (singleCell.length > config.singleCellNum) {
			return mergeSingleCell(problem, config)
		}
		// return killerSudoku.generateProblem(sudoku)
	}

	return problem
}

const generateProblemAddItem = (
	occupiedList: number[],
	row: number,
	col: number,
	level: number,
	usedDirection: number[]
): {
	row: number
	col: number
	index: number
}[] => {
	// console.log('usedDirection', usedDirection, row, col)
	if (level > 4 || usedDirection.length === 2) {
		return []
	}
	let direction = -1

	do {
		const rd = random(0, 6)
		// if (rd < 10) {
		// 	direction = 3
		// }
		// if (rd < 8) {
		// 	direction = 2
		// }
		if (rd < 6) {
			direction = 1
		}
		if (rd < 3) {
			direction = 0
		}
		// direction++
	} while (usedDirection.includes(direction))

	usedDirection.push(direction)

	let newRow = row
	let newCol = col
	switch (direction) {
		case 0:
			// right
			if (row + 1 > 9) {
				return generateProblemAddItem(
					occupiedList,
					row,
					col,
					level + 1,
					usedDirection
				)
			}
			newRow = row + 1

			break
		case 1:
			// bottom
			if (col + 1 > 9) {
				return generateProblemAddItem(
					occupiedList,
					row,
					col,
					level + 1,
					usedDirection
				)
			}
			newCol = col + 1
			break
		case 2:
			if (col - 1 <= 0) {
				return generateProblemAddItem(
					occupiedList,
					row,
					col,
					level + 1,
					usedDirection
				)
			}
			newCol = col - 1
			break
		case 3:
			if (row - 1 <= 0) {
				return generateProblemAddItem(
					occupiedList,
					row,
					col,
					level + 1,
					usedDirection
				)
			}
			newRow = row - 1
			break

		default:
			break
	}

	// console.log(
	// 	'occupiedList',
	// 	(newRow - 1) * 9 + newCol - 1,
	// 	occupiedList.includes((newRow - 1) * 9 + newCol - 1)
	// )
	if (occupiedList.includes((newRow - 1) * 9 + newCol - 1)) {
		return []
		// return generateProblemAddItem(
		// 	occupiedList,
		// 	row,
		// 	col,
		// 	// newRow,
		// 	// newCol,
		// 	level + 1,
		// 	usedDirection
		// )
	}
	return [
		{
			row: newRow,
			col: newCol,
			index: (newRow - 1) * 9 + newCol - 1,
		},
	]
}

const generateKillerSudokuProblemFunc = (
	sudoku: number[],
	problem: KillerSudokuProblemItem[],
	occupiedList: number[],
	list: {
		row: number
		col: number
		val: number
	}[],
	currentItem: {
		row: number
		col: number
	},
	config: {
		level: number
		count: number
		userdIndex: {
			[index: number]: number
		}
	}
): KillerSudokuProblemItem[] => {
	let problemList: KillerSudokuProblemItem[] = []

	let count = 0
	let i = 0
	do {
		if (count > 50) {
			break
		}
		count++
		// console.log('count', count)

		i++
		let tempList: typeof problemList = []
		let isPass = true
		for (let i = 0; i < 1; i++) {
			if (occupiedList.length >= 81) {
				// console.log(
				// 	'--------------------pList',
				// 	occupiedList.length
				// 	// occupiedList
				// )
				break
			}
			const pList = generateKillerSudokuSumItem(
				sudoku,
				problem,
				occupiedList,
				[],
				0,
				0,
				1
			)

			// console.log(
			// 	'--------------------pList',
			// 	pList,
			// 	occupiedList.length
			// 	// occupiedList
			// )
			if (!sumRule(pList)) {
				isPass = false
			}
			tempList.push({
				type: 'Sum',
				val: pList.reduce((pv, cv) => pv + cv.val, 0),
				list: pList.map((v) => {
					return { ...v, val: 0 }
				}),
			})
		}

		const tProblem = [...problemList, ...tempList]
		new Array(81)
			.fill(0)
			.map((_, i) => {
				if (occupiedList.includes(i)) {
					return -1
				}
				return i
			})
			.filter((v) => v >= 0)
			.forEach((i) => {
				tProblem.push({
					type: 'Sum',
					val: sudoku[i],
					list: [
						{
							row: Math.floor(i / 9) + 1,
							col: (i % 9) + 1,
						},
					],
				})
			})

		// console.time('killerSudoku')
		// // console.log('tProblem', tProblem)

		// console.log('SumItem', occupiedList.length, i)
		// console.log('isPass', isPass)
		// || sol.length === 0
		if (!isPass) {
			occupiedList = restoreOccupiedList(tempList, occupiedList)
			// if (sol.length === 0) {
			// console.log('occupiedList', occupiedList)
			// break
			continue
		}
		const sol = killerSudoku.solve(
			tProblem.map((v) => {
				return {
					type: v.type,
					val: v.val,
					list: v.list.map((sv) => {
						return {
							row: sv.row,
							col: sv.col,
							val: 0,
						}
					}),
				}
			}),
			{
				maxSolutionCount: 2,
			}
		)
		// console.timeEnd('killerSudoku')
		// console.log(
		// 	'sol',
		// 	sol.length,
		// 	'isPass',
		// 	isPass,
		// 	sol,
		// 	tProblem,
		// 	tProblem.reduce((pv, cv) => {
		// 		return pv + cv.val
		// 	}, 0),
		// 	occupiedList.length,
		// 	count
		// )
		// // || sol.length === 0
		// if (sol.length === 0) {
		// 	occupiedList = restoreOccupiedList(tempList, occupiedList)
		// 	tempList.forEach((v) => {
		// 		problemList.push(v)
		// 	})
		// 	break
		// 	continue
		// }

		if (sol.length !== 1) {
			occupiedList = restoreOccupiedList(tempList, occupiedList)
			// if (sol.length === 0) {
			// console.log('occupiedList', occupiedList)

			continue
		}

		tempList.forEach((v) => {
			problemList.push(v)
		})

		// console.log(problemList, occupiedList)
		// problemList.push({
		// 	type: 'Sum',
		// 	val: pList.reduce((pv, cv) => pv + cv.val, 0),
		// 	list: pList.map((v) => {
		// 		return { ...v, val: 0 }
		// 	}),
		// })
	} while (occupiedList.length < 81)

	// console.log(problemList, occupiedList)
	// console.log(problemList.filter((v) => v.list.length === 1).length)
	// console.log(problemList.filter((v) => v.list.length === 2).length)
	// console.log(problemList.filter((v) => v.list.length === 3).length)
	// console.log(problemList.filter((v) => v.list.length === 4).length)
	// console.log(problemList.filter((v) => v.list.length === 5).length)
	return problemList
}

const generateKillerSudokuSumItem = (
	sudoku: number[],
	problem: KillerSudokuProblemItem[],
	occupiedList: number[],
	list: {
		row: number
		col: number
		val: number
	}[],
	row: number,
	col: number,
	// config: {
	// 	level: number
	// 	count: number
	// 	userdIndex: {
	// 		[index: number]: number
	// 	}
	// }
	level: number,
	count: number = 1
): {
	row: number
	col: number
	val: number
}[] => {
	let maxLevel = 3
	let maxLength = 4
	if (level === maxLevel || list.length > maxLength) {
		return list
	}
	if (level === 1) {
		let tempIndex = -1
		do {
			tempIndex++
			if (tempIndex >= 81) {
				continue
			}
		} while (occupiedList.includes(tempIndex))
		if (tempIndex >= 81) {
			return list
		}

		row = Math.floor(tempIndex / 9) + 1
		col = (tempIndex % 9) + 1
	}

	// 1、确定哪个坐标开始，从左往右，从上往下，已占用的下一个
	// 2、确认占用几个（最高4个，指4个方向，优先级是右下左上
	const numbersRandom = random(0, 100)
	let cellNumber = 1
	if (numbersRandom < 100 + level * 10 - 1) {
		cellNumber = 3
	}
	if (numbersRandom < 90 + level * 10 - 1) {
		cellNumber = 2
	}
	if (numbersRandom < 80 + level * 10 - 1) {
		cellNumber = 1
	}
	if (numbersRandom < 55 && level !== 1) {
		cellNumber = 0
	}
	// if (numbersRandom < 100 + level * 10 - 1) {
	// 	cellNumber = 3
	// }
	// if (numbersRandom < 90 + level * 10 - 1) {
	// 	cellNumber = 2
	// }
	// if (numbersRandom < 75 + level * 10 - 1) {
	// 	cellNumber = 1
	// }
	// if (numbersRandom < 45 && level !== 1) {
	// 	cellNumber = 0
	// }


	let index = (row - 1) * 9 + col - 1

	// console.log('number', number, numbersRandom)
	if (!occupiedList.includes(index) && list.length < 5) {
		occupiedList.push(index)
		list.push({
			row,
			col,
			val: sudoku[index],
		})
	}
	for (let i = 0; i < cellNumber; i++) {
		const item = generateProblemAddItem(occupiedList, row, col, 1, [])?.[0]
		// console.log('item', item)
		if (item?.row) {
			if (!occupiedList.includes(item.index) && list.length < maxLength) {
				occupiedList.push(item.index)
				list.push({
					row: item.row,
					col: item.col,
					val: sudoku[item.index],
				})
			}
		}
	}

	const nextItem = list[list.length - random(1, 2)]

	// 3、确认走哪个坐标继续走，右下左上，然后循环。最多不超过5个

	return generateKillerSudokuSumItem(
		sudoku,
		problem,
		occupiedList,
		list,
		nextItem.row,
		nextItem.col,
		level + 1,
		count + 1
	)
}


// const generateKillerSudokuSumItem = (
// 	sudoku: number[],
// 	problem: KillerSudokuProblemItem[],
// 	occupiedList: number[],
// 	list: {
// 		row: number
// 		col: number
// 		val: number
// 	}[],
// 	row: number,
// 	col: number,
// 	// config: {
// 	// 	level: number
// 	// 	count: number
// 	// 	userdIndex: {
// 	// 		[index: number]: number
// 	// 	}
// 	// }
// 	level: number,
// 	maxCellNumber: number,
// 	count: number = 1
// ): {
// 	row: number
// 	col: number
// 	val: number
// }[] => {
// 	let maxLevel = 3
// 	let maxLength = 5
// 	if (level === maxLevel || list.length > maxLength) {
// 		return list
// 	}
// 	if (level === 1) {
// 		let tempIndex = -1
// 		do {
// 			tempIndex++
// 			if (tempIndex >= 81) {
// 				continue
// 			}
// 		} while (occupiedList.includes(tempIndex))
// 		if (tempIndex >= 81) {
// 			return list
// 		}

// 		row = Math.floor(tempIndex / 9) + 1
// 		col = (tempIndex % 9) + 1
// 	}

// 	// 1、确定哪个坐标开始，从左往右，从上往下，已占用的下一个
// 	// 2、确认占用几个（最高4个，指4个方向，优先级是右下左上
// 	const numbersRandom = random(0, 100)
// 	let cellNumber = 1
// 	if (numbersRandom < 100 + level * 10 - 1) {
// 		cellNumber = 3
// 	}
// 	if (numbersRandom < 90 + level * 10 - 1) {
// 		cellNumber = 2
// 	}
// 	if (numbersRandom < 75 + level * 10 - 1) {
// 		cellNumber = 1
// 	}
// 	if (numbersRandom < 35 && level !== 1) {
// 		cellNumber = 0
// 	}
// 	if (!maxCellNumber) {
// 		if (numbersRandom < 100) {
// 			maxCellNumber = 5
// 		}
// 		if (numbersRandom < 95) {
// 			maxCellNumber = 4
// 		}
// 		if (numbersRandom < 90) {
// 			maxCellNumber = 3
// 		}
// 		if (numbersRandom < 52) {
// 			maxCellNumber = 2
// 		}
// 		if (numbersRandom < 5) {
// 			maxCellNumber = 1
// 		}
// 	}
// 	console.log(
// 		'maxCellNumber',
// 		maxCellNumber,
// 		list.length,
// 		occupiedList,
// 		numbersRandom,
// 		cellNumber
// 	)

// 	let index = (row - 1) * 9 + col - 1

// 	// console.log('number', number, numbersRandom)
// 	if (!occupiedList.includes(index) && list.length < 5) {
// 		occupiedList.push(index)
// 		list.push({
// 			row,
// 			col,
// 			val: sudoku[index],
// 		})
// 	}
// 	for (let i = 0; i < cellNumber; i++) {
// 		const item = generateProblemAddItem(occupiedList, row, col, 1, [])?.[0]
// 		// console.log('item', item)
// 		if (item?.row) {
// 			if (!occupiedList.includes(item.index) && list.length < maxLength) {
// 				occupiedList.push(item.index)
// 				list.push({
// 					row: item.row,
// 					col: item.col,
// 					val: sudoku[item.index],
// 				})
// 			}
// 		}
// 	}

// 	const nextItem = list[list.length - random(1, 2)]

// 	// 3、确认走哪个坐标继续走，右下左上，然后循环。最多不超过5个

// 	return generateKillerSudokuSumItem(
// 		sudoku,
// 		problem,
// 		occupiedList,
// 		list,
// 		nextItem.row,
// 		nextItem.col,
// 		level + 1,
// 		maxCellNumber,
// 		count + 1
// 	)
// }
const restoreOccupiedList = (
	tempList: KillerSudokuProblemItem[],
	occupiedList: number[]
) => {
	let indexList: number[] = []
	tempList.forEach((v) => {
		v.list.forEach((sv) => {
			let index = (sv.row - 1) * 9 + sv.col - 1
			indexList.push(index)
		})
	})
	return occupiedList.filter((v) => {
		return !indexList.includes(v)
	})
}

const sumRule = (
	list: {
		row: number
		col: number
		val: number
	}[]
) => {
	const sum = list.reduce((pv, cv) => {
		return pv + cv.val
	}, 0)
	// console.log('sum->', sum, list)
	const arr = []
	for (let i = 0; i < list.length; i++) {
		arr.push(list[i].val)
	}
	arr.sort((a, b) => a - b)

	// console.log(arr)
	let tempNum = arr[0]
	for (let i = 1; i < list.length; i++) {
		if (arr[i] === tempNum) {
			return false
		}
		tempNum = arr[i]
	}

	if (list.length === 1) {
		return sum >= 1 && sum <= 9
	}
	if (list.length === 2) {
		return sum >= 3 && sum <= 17
	}
	if (list.length === 3) {
		return sum >= 6 && sum <= 24
	}
	if (list.length === 4) {
		return sum >= 10 && sum <= 30
	}
	if (list.length === 5) {
		return sum >= 15 && sum <= 35
	}
	return true
}

const getAllAnswersForSum = (
	deep: number,
	sum: number,
	arr: number[] = [],
	maxNum: number = 9
): number[][] => {
	if (arr.length === 0) {
		arr = new Array(deep).fill(0)
	}
	// console.log(deep)

	let sumArr: number[][] = []
	for (let i = deep; i <= maxNum; i++) {
		// console.log(i)
		if (deep >= 1) {
			arr[deep - 1] = i
			if (deep === 1) {
				let tempNum = 0
				let isAscend = true
				let tempSum = 0
				for (let i = 0; i < arr.length; i++) {
					tempSum += arr[i]
					if (!tempNum) {
						tempNum = arr[i]
						continue
					}

					if (arr[i] <= tempNum) {
						isAscend = false
						break
					}
					tempNum = arr[i]
				}

				// console.log('isAscend', isAscend, tempSum, sum)
				if (isAscend && tempSum === sum) {
					sumArr.push([...arr])
				}
			}
		}
		if (deep > 1) {
			sumArr = [
				...sumArr,
				...getAllAnswersForSum(deep - 1, sum, arr, maxNum - 1),
			]
		}
	}

	return sumArr
}

const isEqualSub = (
	v1: {
		row: number
		col: number
		val: number
	},
	v2: {
		row: number
		col: number
		val: number
	}
) => {
	// 行
	// console.log(v1, v2)
	// console.log(v1.row, v2.row, v1.row === v2.row && v1.val !== v2.val)
	if (v1.row === v2.row && v1.val === v2.val) {
		return false
	}
	// 列
	// console.log(v1.col, v2.col)
	if (v1.col === v2.col && v1.val === v2.val) {
		return false
	}
	// 宫
	const palace1 = getPalace((v1.row - 1) * 9 + v1.col - 1, v1.row)
	const palace2 = getPalace((v2.row - 1) * 9 + v2.col - 1, v2.row)
	// console.log(palace1, palace2)
	if (palace1 === palace2 && v1.val === v2.val) {
		return false
	}

	return true
}

const isEqual = (
	v: {
		type: 'Sum'
		val: number
		list: {
			row: number
			col: number
		}[]
	},
	valArr: number[]
) => {
	for (let i = 0; i < v.list.length; i++) {
		let j = 0
		do {
			j = j + 1

			// 	j = i + 1 > 3 ? 0 : i + 1
			if (i < j) {
				// console.log(i, j > v.list.length ? 0 : j)
				if (
					!isEqualSub(
						{
							row: v.list[i].row,
							col: v.list[i].col,
							val: valArr[i],
						},
						{
							row: v.list[j].row,
							col: v.list[j].col,
							val: valArr[j],
						}
					)
				) {
					return false
				}
			}
		} while (j < v.list.length - 1)
	}
	return true
}

export const killerSudoku = {
	solve,
	generateProblem,
}

export default killerSudoku
