// const generateKillerSudoku = () => {
// 	console.time('killerSudoku.generateProblem')
// 	const generateProblem = sudoku.killerSudoku.generateProblem([], 'Easy')
// 	console.log('generateProblem', generateProblem)
// 	// console.log(killerSudoku)
// 	// setKillerSudoku(generateProblem.problem)
// 	console.timeEnd('killerSudoku.generateProblem')
// }

import killerSudoku from '../plugins/killerSudoku'

self.addEventListener('message', async (e) => {
	// 接收到消息
	console.log('webworker 1111111111111111111111')
	console.log('webworker', e.data) // Greeting from Main.js，主线程发送的消息

	// const el = document.createElement('iframe')

  console.log(killerSudoku.generateProblem)
  const problem = killerSudoku.generateProblem(e.data.problem || [], e.data.difficulty)
	console.log(
		'webworker',problem
		
	)
	// el.src = 'http://192.168.204.129:23300/generateSudoku'
	// document.body.appendChild(el)
	// console.log(el)
	// let i = 0
	// do {
	//   console.log(i)
	//   i++
	// } while (i < 1000000000)
	// const res = await fetch('http://192.168.204.129:23300/generateSudoku')

	// console.log(await res.text())
	// generateKillerSudoku()
	self.postMessage(problem) // 向主线程发送消息
})
const a = 0
export default a
