import killerSudoku from '../plugins/killerSudoku'

import { WebWorker } from '@nyanyajs/utils'

WebWorker.onMessage<'KillerSudokuGenerateProblem' | 'KillerSudokuSolve'>(
	(method, params) => {
		if (method === 'KillerSudokuGenerateProblem') {
			if (!params.difficulty) {
				WebWorker.postMessage(method, {
					problem: [],
					difficulty: params.difficulty,
					solution: [],
				})
				return
			}
			const problem = killerSudoku.generateProblem(
				params.problem || [],
				params.difficulty,
				{
					log: params?.options?.log || false,
				}
			)
			WebWorker.postMessage(method, problem)
			return
		}
		if (method === 'KillerSudokuSolve') {
			if (!params?.problem?.length) {
				WebWorker.postMessage(method, [])
				return
			}
			const sol = killerSudoku.solve(params.problem, params.options || {})
			WebWorker.postMessage(method, sol)
			return
		}
	}
)
