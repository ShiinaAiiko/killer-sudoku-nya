// const problem = [
//   [0, 0, 1, 0, 1, 1, 0], // 1
//   [1, 0, 0, 1, 0, 0, 1], // 2
//   [0, 1, 1, 0, 0, 1, 0], // 3
//   [1, 0, 0, 1, 0, 0, 0], // 4
//   [0, 1, 0, 0, 0, 0, 1], // 5
//   [0, 0, 0, 1, 1, 0, 1], // 6
//   [1, 0, 0, 1, 0, 0, 0], // 7
//   [0, 1, 1, 0, 0, 1, 0], // 8
//   [1, 0, 0, 1, 0, 0, 0], // 9
//   // [0, 1, 0, 0, 0, 0, 1],
// ]

class LinkNode {
	val: string = ''

	row: number = 0
	col: number = 0

	mark: boolean = false

	top?: LinkNode
	bottom?: LinkNode
	left?: LinkNode
	right?: LinkNode
	constructor(params: {
		val: string

		row: number
		col: number

		top?: LinkNode
		bottom?: LinkNode
		left?: LinkNode
		right?: LinkNode
	}) {
		this.val = params.val

		this.row = params.row
		this.col = params.col

		this.top = params.top
		this.bottom = params.bottom
		this.left = params.left
		this.right = params.right
	}
}

export const solve = (
	problem: number[][],
	options?: {
		maxSolutionCount?: number
		depthLimit?: number
		algorithms?: 'Recursion' | 'DFS'
		log?: boolean
	}
) => {
	const algorithms = options?.algorithms || 'DFS'
	// console.log('dlx.solve.problem', problem)

	const linkList: LinkNode[] = []

	const linkListColObj: {
		[c: number]: LinkNode[]
	} = {}

	// 必须保证每个子数组的length一样
	let nodeNum = 0

	let firstColNode: LinkNode | undefined
	let nextColNode: LinkNode | undefined
	for (let r = 0; r < problem.length; r++) {
		if (r >= 1 && problem[r].length !== problem[r - 1].length) {
			console.log(`结束 -> 第${r}个子数组长度不一致`)
			return []
		}

		firstColNode = undefined
		nextColNode = undefined

		for (let c = 0; c < problem[r].length; c++) {
			const linkCNode = new LinkNode({
				val: 'C' + String(c + 1),
				row: 0,
				col: c + 1,
			})

			if (!linkListColObj[c]) {
				linkListColObj[c] = [linkCNode]
				linkList.push(linkCNode)
			}

			// console.log(problem[r][c] + ' - ')

			if (problem[r][c] > 0) {
				nodeNum++

				const linkNode = new LinkNode({
					val: String(nodeNum),
					row: r + 1,
					col: c + 1,
				})

				if (!firstColNode) {
					firstColNode = linkNode
				}

				if (nextColNode) {
					linkNode.left = nextColNode
					nextColNode.right = linkNode
				}
				nextColNode = linkNode

				linkListColObj[c].push(linkNode)
				linkList.push(linkNode)
			}
		}
		if (nextColNode && firstColNode) {
			firstColNode.left = nextColNode
			nextColNode.right = firstColNode
		}
	}

	let fristCNode: LinkNode | undefined
	let nextCNode: LinkNode | undefined
	let nextNode: LinkNode | undefined

	Object.keys(linkListColObj).forEach((col, ci, colArr) => {
		const c = Number(col)

		!fristCNode && (fristCNode = linkListColObj[c][0])

		if (nextCNode) {
			nextCNode.right = linkListColObj[c][0]
			linkListColObj[c][0].left = nextCNode
		}

		nextCNode = linkListColObj[c][0]

		if (ci === colArr.length - 1) {
			nextCNode.right = fristCNode
			fristCNode.left = nextCNode
		}

		linkListColObj[c].forEach((node, i) => {
			if (nextNode) {
				nextNode.bottom = node
				node.top = nextNode
			}

			if (i === linkListColObj[c].length - 1) {
				node.bottom = linkListColObj[c][0]
			}
			nextNode = node
		})

		linkListColObj[c][0].top = nextNode
		nextNode = undefined
	})

	// console.log('linkList ->', linkList)
	// console.log(linkListColObj)

	let solutions: number[][] = []
	// dlxFunc(linkList, solutions, [], 1, config)

	switch (algorithms) {
    case 'Recursion':
			options?.log && console.time('time.dlxRecursion')
			solutions = dlxRecursion(linkList, [], [], 1, {
				count: 0,
				// depthLimit: 10,
				depthLimit: options?.depthLimit,
				maxSolutionCount: options?.maxSolutionCount,
			})
			options?.log && console.timeEnd('time.dlxRecursion')
			break
		case 'DFS':
			options?.log && console.time('time.dlxDFS')
			solutions = dlxDFS(linkList, {
				// depthLimit: 10,
				depthLimit: options?.depthLimit,
				maxSolutionCount: options?.maxSolutionCount,
			})
			options?.log && console.timeEnd('time.dlxDFS')
			break

		default:
			break
	}
	// console.log('最终答案：', solutions)
	return solutions.map((v) => {
		v.sort((a, b) => {
			return a - b
		})
		return v.map((sv) => {
			return sv - 1
		})
	})
	// return []
}

const dlxRecursion = (
	linkList: LinkNode[],
	solutions: number[][],
	solution: number[],
	level: number,
	config: {
		count: number
		depthLimit?: number
		maxSolutionCount?: number
	}
): number[][] => {
	if (config.maxSolutionCount && solutions.length >= config.maxSolutionCount) {
		return solutions
	}

	// console.error('超次数了', config.count)
	if (config.count > 60000) {
		console.error('超次数了', config.count)
		return solutions
	}
	config.count++

	if (!linkList.length) {
		solutions.push(solution)
		// console.log('当前次数 ->', config.count)
		return solutions
	}

	if (
		linkList.length >= 1 &&
		linkList.filter((v) => v.row === 0).length === linkList.length
	) {
		// console.log('错误解 ->', subSolution, newLinkList)
		// return []
		return solutions
	}

	// 1、获取数量最小col的第一个CNode的Nodes

	const newNodeList = getNodeListWithMinNumCol(linkList)

	// console.log('newNodeList', newNodeList)
	if (!newNodeList.length) return []

	if (level >= 100) {
		return solutions
	}

	// 2、遍历nodeList，开始消除第一层和第二层

	// let firstCNode: LinkNode | undefined
	// // const markNode = newNodeList[0]

	// if (!firstCNode) return []
	// console.log(newNodeList.length)
	newNodeList.forEach((markNode) => {
		const cnData = clearNodes(linkList, solution, markNode)

		if (config?.depthLimit && solution.length >= config.depthLimit) {
			// console.log('结束', sVal.solution)
			return
		}
		dlxRecursion(cnData.linkList, solutions, cnData.solution, level + 1, config)
	})

	// 3、再次第一步

	// 4、记录每次到终点使用过哪些col

	// 5、到了终点就意味着这个是答案，
	// 继续下一个第一层最小col的时候就是新的答案

	return solutions
}

const dlxDFS = (
	linkList: LinkNode[],
	config: {
		depthLimit?: number
		maxSolutionCount?: number
	}
): number[][] => {
	const solutions: number[][] = []
	let stack: {
		markNode?: LinkNode
		solution: number[]
		nodeList: LinkNode[]
	}[] = []
	// let sSolution = []

	let count = 0

	stack.push({
		nodeList: linkList,
		solution: [],
	})
	while (stack.length != 0) {
		// console.log('stack', stack.length)
		if (count === 100000) {
			console.log('提前结束', count)
			break
		}
		count++
		let sVal = stack.pop()
		if (!sVal) {
			continue
		}
		if (sVal.markNode) {
			const cnData = clearNodes(sVal.nodeList, sVal.solution, sVal.markNode)
			// console.log('cnData', cnData, sSolution, 'sSolution', sSolution.length)
			// sSolution.push(cnData.row)

			sVal.solution = cnData.solution
			// console.log(cnData.row)

			if (config?.depthLimit && sVal.solution.length > config.depthLimit) {
				// console.log('结束', sVal.solution)
				continue
			}

			if (!cnData.linkList.length) {
				solutions.push(sVal.solution)

				// 中途退出
				if (
					config?.maxSolutionCount &&
					solutions.length >= config.maxSolutionCount
				) {
					break
				}

				continue
			}
			const newNodeList = getNodeListWithMinNumCol(cnData.linkList)

			// console.log('newNodeList.length', newNodeList.length, sVal.markNode.row)
			if (!newNodeList.length) {
				// console.log('错误解', sVal.solution.length)
				continue
			}
			for (var i = newNodeList.length - 1; i >= 0; i--) {
				stack.push({
					markNode: newNodeList[i],
					solution: sVal.solution,
					nodeList: cnData.linkList,
				})
			}
		} else {
			// 当找不到顶级节点的时候就创建
			const newNodeList = getNodeListWithMinNumCol(sVal.nodeList)

			for (var i = newNodeList.length - 1; i >= 0; i--) {
				stack.push({
					markNode: newNodeList[i],
					nodeList: sVal.nodeList,
					solution: [],
				})
			}
		}
	}
	return solutions
}

const clearNodes = (
	linkList: LinkNode[],
	solution: number[],
	markNode: LinkNode
): {
	linkList: LinkNode[]
	solution: number[]
	row: number
} => {
	linkList.forEach((v) => {
		v.mark = false
	})

	markColNode(markNode)

	linkList
		.filter((v) => {
			return v.mark && v.col !== markNode.col && v.row === markNode.row
		})
		.forEach((node) => {
			markColNode(node)
			// markInitNode(node, node.col)
		})

	return {
		linkList: linkList.filter((v) => {
			return !v.mark
		}),
		solution: solution.concat([markNode.row]),
		row: markNode.row,
	}
}

const getNodeListWithMinNumCol = (linkList: LinkNode[]) => {
	// 继续递归的时候
	// 如果为dlxRecursion为true则继续
	// 如果dlxRecursion为false，则是错误答案，继续循环下一个
	// 如果还是错误答案，且没有下一个了，则返回上一级返回false

	// 获取第一个ColNode
	let firstCNode: LinkNode | undefined
	let rowCountArr: {
		[col: number]: {
			num: number
			colNode: LinkNode | undefined
		}
	} = {}
	linkList.forEach((node) => {
		// 每次从第一个开始 （警告！后期记得加sudoku类型区分，）
		// if (node.row === 0) {
		// 	if (!firstCNode) {
		// 		firstCNode = node
		// 	}
		// 	if (node.col < firstCNode.col) {
		// 		node = firstCNode
		// 	}
		// }

		// sudoku专属

		if (!rowCountArr[node.col]) {
			rowCountArr[node.col] = {
				num: 1,
				colNode: undefined,
			}
		} else {
			rowCountArr[node.col].num++
		}

		if (node.row === 0) {
			rowCountArr[node.col].colNode = node
		}
	})

	let leastNumCol = {
		colNode: undefined as LinkNode | undefined,
		col: 999999,
		num: 999999,
	}
	Object.keys(rowCountArr).forEach((col) => {
		if (rowCountArr[Number(col)].num < leastNumCol.num) {
			leastNumCol.col = Number(col)
			leastNumCol.num = rowCountArr[Number(col)].num
			leastNumCol.colNode = rowCountArr[Number(col)].colNode
		}
	})

	firstCNode = leastNumCol.colNode

	// console.log(
	// 	'firstCNode',
	// 	firstCNode,
	// 	rowCountArr,
	// 	linkList,
	// 	Object.keys(rowCountArr).length
	// )
	// console.log(
	// 	'firstCNode',
	// 	firstCNode,
	// 	rowCountArr,
	// 	leastNumCol,
	// 	linkList,
	// 	linkList
	// 		.filter((v) => {
	// 			return v.row === 0
	// 		})
	// 		.map((v) => {
	// 			let count = 0
	// 			let node = v

	// 			do {
	// 				count++
	// 				if (node.bottom) {
	// 					node = node.bottom
	// 				}
	// 			} while (node.val !== v.val)
	// 			return count
	// 		})
	// )

	// 获取此Col下的所有Node
	let nodes = linkList.filter((v) => v.col === firstCNode?.col && v.row !== 0)
	// console.log(
	// 	'nodes=>',
	// 	level,
	// 	nodes,
	// 	nodes.map((v) => v.val),
	// 	!nodes
	// )
	return nodes
}

const markColNode = (markNode: LinkNode) => {
	// 普通节点
	let currentNode: LinkNode | undefined = markNode
	do {
		if (currentNode) {
			currentNode.bottom &&
				!currentNode.bottom.mark &&
				(currentNode.bottom.mark = true)

			if (currentNode.row !== 0) {
				currentNode.right && markRowNode(currentNode.right)
			}

			currentNode = currentNode.bottom
		}
	} while (currentNode?.val !== markNode.val)
}

const markRowNode = (markNode: LinkNode) => {
	// 普通节点
	let currentNode: LinkNode | undefined = markNode
	do {
		if (currentNode) {
			currentNode.right &&
				!currentNode.right.mark &&
				(currentNode.right.mark = true)

			currentNode = currentNode.right
		}
	} while (currentNode?.val !== markNode.val)
}

export const dlx = {
	solve,
}

export default dlx

// const dlxFunc = (
// 	linkList: LinkNode[],
// 	solutions: number[][],
// 	solution: number[],
// 	level: number,
// 	config: {
// 		count: number
// 	}
// ): number[] => {
// 	// console.log(linkList)

// 	if (config.count > 10000) {
// 		console.error('次数过多')
// 		return []
// 	}

// 	config.count++

// 	// 继续递归的时候
// 	// 如果为dlxRecursion为true则继续
// 	// 如果dlxRecursion为false，则是错误答案，继续循环下一个
// 	// 如果还是错误答案，且没有下一个了，则返回上一级返回false

// 	// 获取第一个ColNode
// 	let firstCNode: LinkNode | undefined
// 	let rowCountArr: {
// 		[col: number]: {
// 			num: number
// 			colNode: LinkNode | undefined
// 		}
// 	} = {}
// 	linkList.forEach((node) => {
// 		// 每次从第一个开始 （警告！后期记得加sudoku类型区分，）
// 		// if (node.row === 0) {
// 		// 	if (!firstCNode) {
// 		// 		firstCNode = node
// 		// 	}
// 		// 	if (node.col < firstCNode.col) {
// 		// 		node = firstCNode
// 		// 	}
// 		// }

// 		// sudoku专属

// 		if (!rowCountArr[node.col]) {
// 			rowCountArr[node.col] = {
// 				num: 1,
// 				colNode: undefined,
// 			}
// 		} else {
// 			rowCountArr[node.col].num++
// 		}

// 		if (node.row === 0) {
// 			rowCountArr[node.col].colNode = node
// 		}
// 	})

// 	let leastNumCol = {
// 		colNode: undefined as LinkNode | undefined,
// 		col: 999999,
// 		num: 999999,
// 	}
// 	Object.keys(rowCountArr).forEach((col) => {
// 		if (rowCountArr[Number(col)].num < leastNumCol.num) {
// 			leastNumCol.col = Number(col)
// 			leastNumCol.num = rowCountArr[Number(col)].num
// 			leastNumCol.colNode = rowCountArr[Number(col)].colNode
// 		}
// 	})

// 	firstCNode = leastNumCol.colNode

// 	// console.log(
// 	// 	'firstCNode',
// 	// 	firstCNode,
// 	// 	rowCountArr,
// 	// 	linkList,
// 	// 	Object.keys(rowCountArr).length
// 	// )
// 	// console.log(
// 	// 	'firstCNode',
// 	// 	firstCNode,
// 	// 	rowCountArr,
// 	// 	leastNumCol,
// 	// 	linkList,
// 	// 	linkList
// 	// 		.filter((v) => {
// 	// 			return v.row === 0
// 	// 		})
// 	// 		.map((v) => {
// 	// 			let count = 0
// 	// 			let node = v

// 	// 			do {
// 	// 				count++
// 	// 				if (node.bottom) {
// 	// 					node = node.bottom
// 	// 				}
// 	// 			} while (node.val !== v.val)
// 	// 			return count
// 	// 		})
// 	// )

// 	// 获取此Col下的所有Node
// 	let nodes = linkList.filter((v) => v.col === firstCNode?.col && v.row !== 0)
// 	// console.log(
// 	// 	'nodes=>',
// 	// 	level,
// 	// 	nodes,
// 	// 	nodes.map((v) => v.val),
// 	// 	!nodes
// 	// )
// 	if (!nodes.length) return []
// 	// console.log('firstCNode', firstCNode, rowCountArr, nodes)

// 	nodes.forEach((markNode) => {
// 		// console.log('markNodemarkNodemarkNode', markNode)

// 		// console.log('ROW=============>', markNode.row)
// 		const subSolution = solution.concat([markNode.row])
// 		// solutions.push(markNode.row)

// 		linkList.forEach((v) => {
// 			v.mark = false
// 		})

// 		markColNode(markNode)
// 		// markInitNode(markNode, markNode.col)
// 		// console.log(
// 		// 	'第一次',
// 		// 	linkList
// 		// 		.filter((v) => {
// 		// 			return v.mark
// 		// 		})
// 		// 		.map((v) => v.val)
// 		// )

// 		linkList
// 			.filter((v) => {
// 				return v.mark && v.col !== markNode.col && v.row === markNode.row
// 			})
// 			.forEach((node) => {
// 				markColNode(node)
// 				// markInitNode(node, node.col)
// 			})

// 		// console.log(
// 		// 	'第二次',
// 		// 	linkList.filter((v) => {
// 		// 		return v.mark && v.col !== markNode.col && v.row === markNode.row
// 		// 	}),
// 		// 	linkList
// 		// 		.filter((v) => {
// 		// 			return v.mark
// 		// 		})
// 		// 		.map((v) => v.val)
// 		// )

// 		const newLinkList = linkList.filter((v) => {
// 			return !v.mark
// 		})

// 		// console.log(
// 		// 	'newLinkList =>',
// 		// 	level,
// 		// 	linkList.length,
// 		// 	newLinkList.length,
// 		// 	newLinkList.filter((v) => v.row === 0)
// 		// )

// 		// 下一级
// 		if (
// 			newLinkList.length >= 1 &&
// 			newLinkList.filter((v) => v.row === 0).length === newLinkList.length
// 		) {
// 			// console.log('错误解 ->', subSolution, newLinkList)
// 			return []
// 		}
// 		// if (solutions.length >= 2) {
// 		// 	// console.log("已经有一个答案了")
// 		// 	return []
// 		// }
// 		if (newLinkList.length) {
// 			if (level >= 100) {
// 				return []
// 			}
// 			// level++

// 			const ans = dlxFunc(
// 				newLinkList,
// 				solutions,
// 				subSolution,
// 				level + 1,
// 				config
// 			)
// 			// console.log(
// 			// 	'答案 -> ans =>',
// 			// 	nodes,
// 			// 	solution.length,
// 			// 	ans.length,
// 			// 	newLinkList.length
// 			// )
// 			return ans
// 		}
// 		// console.log('正确解 ->', subSolution)
// 		solutions.push(subSolution)
// 		return subSolution
// 	})

// 	return []
// }
