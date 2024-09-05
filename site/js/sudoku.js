'use strict'

class Sudoku {
  constructor(cont, matrix=Array(9).fill(null)) {
    this.cont = cont
    this.matrix = matrix.slice()
    this.active = null
    this.disabled = []
    for (let i = 0; i < this.matrix.length; i++) {
      let div = document.createElement('div')
      div.classList.add('sudokuCell')
      div.id = `sudoku_${i}`
      this.cont.appendChild(div)
      if (this.matrix[i] !== null) {
        this.disabled.push(i)
      }
    }
  }

  #fillBased() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.matrix[r * 9 + c] = ~~((r * 3 + r / 3 + c) % 9 + 1)
      }
    }
  }

  #transpose() {
    let newMatrix = []
    for (let i = 0; i < this.matrix.length; i++) {
      let newIndex = (i % 9) * 9 + ~~(i / 9)
      newMatrix[newIndex] = this.matrix[i]
    }
    this.matrix = newMatrix
  }

  #swapRows() {
    let area = ~~(Math.random() * 3)
    let row0 = ~~(Math.random() * 3)
    let row1 = ~~(Math.random() * 3)
    let index0 = area * 27 + row0 * 9
    let index1 = area * 27 + row1 * 9
    for (let i = 0; i < 9; i++) {
      [this.matrix[index0 + i], this.matrix[index1 + i]] = [this.matrix[index1 + i], this.matrix[index0 + i]]
    }
  }

  #swapCols() {
    this.#transpose()
    this.#swapRows()
    this.#transpose()
  }

  #swapRowsArea() {
    let area0 = ~~(Math.random() * 3)
    let area1 = ~~(Math.random() * 3)
    let index0 = area0 * 27
    let index1 = area1 * 27
    for (let i = 0; i < 27; i++) {
      [this.matrix[index0 + i], this.matrix[index1 + i]] = [this.matrix[index1 + i], this.matrix[index0 + i]]
    }
  }

  #swapColsArea() {
    this.#transpose()
    this.#swapRowsArea()
    this.#transpose()
  }

  #mix(n) {
    let funArr = [
      this.#swapRows.bind(this), 
      this.#swapCols.bind(this), 
      this.#swapRowsArea.bind(this), 
      this.#swapColsArea.bind(this),
      this.#transpose.bind(this)
    ]
    for (let i = 0; i < n; i++) {
      let randIndex = ~~(Math.random() * funArr.length)
      funArr[randIndex]()
    }
  }

  #fixate() {
    for (let i = 0; i < this.matrix.length; i++) {
      if (this.matrix[i] !== null) {
        this.disabled.push(i)
      }
    }
  }

  goHardcore(minleaveAmount=0) {
    let shuffledIndeces = shuffle(Array(81).fill(0).map((_, i) => i))
    let leftAmount = 81
    for (let i = 0; i < shuffledIndeces.length; i++) {
      if (leftAmount <= minleaveAmount) { break }
      let toDelete = this.matrix[shuffledIndeces[i]]
      this.matrix[shuffledIndeces[i]] = null
      leftAmount--
      if (this.solve(2).length !== 1) {
        this.matrix[shuffledIndeces[i]] = toDelete
        leftAmount++
      }
    }
    this.sync()
  }

  solve(limit = Infinity) {
    function getOptions(index, matrix) {
      let optionArr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      for (let i = 0; i < 9; i++) {
        optionArr[matrix[~~(index / 9) * 9 + i] - 1] = null
        optionArr[matrix[i * 9 + index % 9] - 1] = null
        optionArr[matrix[~~(index / 27) * 27 + ~~((index % 9) / 3) * 3 + i + ~~(i / 3) * 6] - 1] = null
      }
      return optionArr.filter(x => x !== null)
    }
    function select(index, num) {
      let delIndexArr = []
      let rowStart = ~~(index / 9) * 9
      let colStart = index % 9
      let blockStart = ~~(index / 27) * 27 + ~~((index % 9) / 3) * 3
      allOptions[index][2] = true
      for (let cell = 0; cell < 9; cell++) {
        if (allOptions[rowStart + cell][1].includes(num)) {
          allOptions[rowStart + cell][1] = allOptions[rowStart + cell][1].filter(x => x !== num)
          delIndexArr.push(rowStart + cell)
        }
        if (allOptions[cell * 9 + colStart][1].includes(num)) {
          allOptions[cell * 9 + colStart][1] = allOptions[cell * 9 + colStart][1].filter(x => x !== num)
          delIndexArr.push(cell * 9 + colStart)
        }
        if (allOptions[blockStart + cell + ~~(cell / 3) * 6][1].includes(num)) {
          allOptions[blockStart + cell + ~~(cell / 3) * 6][1] = allOptions[blockStart + cell + ~~(cell / 3) * 6][1].filter(x => x !== num)
          delIndexArr.push(blockStart + cell + ~~(cell / 3) * 6)
        }
      }
      return delIndexArr
    }
    function unselect(index, num, delIndexArr) {
      allOptions[index][2] = false
      for (let i = 0; i < delIndexArr.length; i++) {
        allOptions[delIndexArr[i]][1].push(num)
      }
    }
    function sol() {
      console.log('sol')
      if (solvedArr.length >= limit) { return }
      if (allOptions.every(x => x[2])) {
        solvedArr.push(matrix.slice())
        return
      }
      let bestOption = null
      for (let option of allOptions) {
        if (!option[2] && option[1].length && (!bestOption || option[1].length < bestOption.length)) {
          bestOption = option
          if (option[1].length === 1) { break }
        }
      }
      if (bestOption === null) { return }
      let [index, numArr] = bestOption
      for (let i = 0; i < numArr.length; i++) {
        matrix[index] = numArr[i]
        let del = select(index, numArr[i])
        sol()
        unselect(index, numArr[i], del)
        matrix[index] = null
      }
    }
    const matrix = this.matrix.slice()
    const solvedArr = []
    const allOptions = []
    for (let i = 0; i < matrix.length; i++) {
      if (matrix[i] === null) {
        allOptions.push([i, getOptions(i, matrix), false])
      }
      else {
        allOptions.push([i, [], true])
      }
    }
    sol()
    return solvedArr
  }

  solveSync(limit=Infinity) {
    let solvedArr = this.solve(limit)
    if (solvedArr.length) {
      this.matrix = solvedArr[0]
      this.sync()
    }
  }

  isSolved(matrix = this.matrix) {
    if (matrix.includes(null)) {
      return false
    }
    for (let r = 0; r < 9; r++) {
      let rowSet = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])
      let colSet = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])
      let blockSet = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])
      for (let c = 0; c < 9; c++) {
        rowSet.delete(matrix[r * 9 + c])
        colSet.delete(matrix[c * 9 + r])
        blockSet.delete(matrix[9 * (3 * ~~(r / 3) + ~~(c / 3)) + c % 3 + 3 * (r % 3)])
      }
      if (rowSet.size !== 0 || colSet.size !== 0 || blockSet.size !== 0) {
        return false
      }
    }
    return true
  }

  clear() {
    this.matrix = Array(81).fill(null)
    this.disabled = []
    this.sync()
  }

  clearGuesses() {
    for (let i = 0; i < this.matrix.length; i++) {
      if (!this.disabled.includes(i)) {
        this.matrix[i] = null
      }
    }
    this.sync()
  }

  change(m) {
    this.matrix = m
    this.sync()
  }

  sync() {
    let cells = Array.from(this.cont.children)
    if (this.cont.querySelectorAll('.sudokuCell').length !== 81) {
      this.cont.innerHTML = ''
      for (let i = 0; i < 81; i++) {
        let div = document.createElement('div')
        div.classList.add('sudokuCell')
        div.id = `sudoku_${i}`
        this.cont.appendChild(div)
      }
    }
    for (let i = 0; i < cells.length; i++) {
      let el = $(`#sudoku_${i}`)
      cells[i].textContent = this.matrix[i]
      if (this.disabled.includes(i)) {
        el.classList.add('disabled')
      }
      else {
        el.classList.remove('disabled')
      }
    }
  }

  main(mixTimes, minleaveAmount=0) {
    this.clear()
    this.#fillBased()
    this.#mix(mixTimes)
    this.goHardcore(minleaveAmount)
    this.#fixate()
    this.sync()
  }
}

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const board = $('#sudoku')
const submit = $('#submit')
const keyboard = $('#keyboard')
const commandBoard = $('#commands')
const sudokuContainer = $('#sudokuContainer')
// do not remove

// hard 902 solutions
const matrix = [
  null,
  null,
  null,
  1,
  null,
  null,
  2,
  null,
  8,
  5,
  null,
  null,
  3,
  null,
  null,
  4,
  null,
  1,
  4,
  7,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  3,
  null,
  7,
  null,
  null,
  null,
  null,
  5,
  null,
  null,
  7,
  8,
  null,
  5,
  null,
  null,
  6,
  null,
  null,
  8,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  9,
  null,
  7,
  null,
  null,
  null,
  9,
  3,
  null,
  null,
  1,
  null,
  null,
  null,
  null,
  null,
  null,
  5,
  null,
  null,
  null,
  null,
  null
]

// easy two solutions
// const matrix = [
//   null,
//   null,
//   null,
//   4,
//   3,
//   null,
//   1,
//   null,
//   2,
//   1,
//   null,
//   null,
//   7,
//   null,
//   8,
//   4,
//   null,
//   null,
//   4,
//   null,
//   null,
//   null,
//   9,
//   null,
//   7,
//   null,
//   8,
//   null,
//   null,
//   7,
//   5,
//   null,
//   null,
//   2,
//   null,
//   3,
//   5,
//   null,
//   4,
//   null,
//   1,
//   3,
//   null,
//   null,
//   9,
//   null,
//   3,
//   null,
//   8,
//   null,
//   null,
//   null,
//   null,
//   6,
//   3,
//   null,
//   2,
//   9,
//   8,
//   1,
//   null,
//   null,
//   null,
//   9,
//   1,
//   8,
//   null,
//   null,
//   7,
//   3,
//   2,
//   null,
//   6,
//   null,
//   5,
//   3,
//   null,
//   null,
//   9,
//   8,
//   null
// ]

// easy one solution
// const matrix = [
//   7,
//   8,
//   null,
//   4,
//   3,
//   null,
//   1,
//   null,
//   2,
//   1,
//   2,
//   9,
//   7,
//   6,
//   8,
//   4,
//   null,
//   5,
//   4,
//   5,
//   null,
//   null,
//   9,
//   null,
//   7,
//   null,
//   8,
//   null,
//   null,
//   7,
//   5,
//   4,
//   null,
//   2,
//   null,
//   3,
//   5,
//   null,
//   4,
//   null,
//   1,
//   3,
//   8,
//   null,
//   9,
//   null,
//   3,
//   null,
//   8,
//   null,
//   null,
//   null,
//   null,
//   6,
//   3,
//   null,
//   2,
//   9,
//   8,
//   1,
//   null,
//   null,
//   null,
//   9,
//   1,
//   8,
//   null,
//   null,
//   7,
//   3,
//   2,
//   null,
//   6,
//   7,
//   5,
//   3,
//   null,
//   null,
//   9,
//   8,
//   null
// ]
const SUDOKU = new Sudoku(board, matrix)

function shuffle(a) {
  const len = a.length
  const arr = a.slice()
  for (let i = 0; i < len; i++) {
    const randIndex = ~~(Math.random() * (len - i) + i)
    const randVal = arr[randIndex]
    arr[randIndex] = arr[i]
    arr[i] = randVal
  }
  return arr
}

function executionTime(f, args, iteratoins) {
  let startTime = Date.now()
  for (let i = 0; i < iteratoins; i++) {
    f(...args)
  }
  return Date.now() - startTime
}

function compareTime(f1, f2, args, iteratoins) {
  let time1 = executionTime(f1, args, iteratoins)
  let time2 = executionTime(f2, args, iteratoins)
  return `${f1.name}: ${time1}ms\n${f2.name}: ${time2}ms`
}

function getOnes(num, bits) {
  if (!bits) {
    bits = num.toString(2).length
  }
  let ones = 0
  for (let i = 0; i < bits; i++) {
    ones += (num >> i) & 1
  }
  return ones
}

function isOptionIn(bit, num) {
  return !!(num & (1 << bit - 1))
}

function activateCell(event) {
  let target = event.target
  if (target.classList.contains('sudokuCell') && !SUDOKU.disabled.includes(Number(target.id.split('_')[1]))) {
    if (SUDOKU.active !== null) {
      $(`#sudoku_${SUDOKU.active}`).classList.remove('activeCell')
    }
    SUDOKU.active = Number(target.id.split('_')[1])
    target.classList.add('activeCell')
  }
  else if (!target.classList.contains('key')) {
    if (SUDOKU.active !== null) {
      $(`#sudoku_${SUDOKU.active}`).classList.remove('activeCell')
    }
    SUDOKU.active = null
  }
}

function changeCellValue(event) {
  if (event.target.classList.contains('key') && SUDOKU.active !== null) {
    let value = event.target.getAttribute('data-value')
    SUDOKU.matrix[SUDOKU.active] = Number(value) || null
    SUDOKU.sync()
  }
}

function keyToMouse(event) {
  let map = {
    'Digit1': '_1',
    'Digit2': '_2',
    'Digit3': '_3',
    'Digit4': '_4',
    'Digit5': '_5',
    'Digit6': '_6',
    'Digit7': '_7',
    'Digit8': '_8',
    'Digit9': '_9',
    'Backspace': 'null'
  }
  let code = event.code
  let id = map[code]
  if (id) {
    let event = new Event('mousedown', {bubbles: true})
    $(`#${id}`).dispatchEvent(event)
  }
}

function check() {
  if (SUDOKU.isSolved()) {
    let raccoon = $('#sudokuWinText')
    raccoon.remove()
    board.innerHTML = ''
    board.style.display = 'block'
    board.appendChild(raccoon)
    raccoon.style.display = 'block'
  }
  else {
    board.classList.add('sudokuLoss')
    setTimeout(() => {
      board.classList.remove('sudokuLoss')
    }, 300)
  }
}

function commandHandle(event) {
  let map = {
    'submit': check,
    'generate': function() {
      this.clear(true)
      SUDOKU.main(100, 35)
    },
    'clear': function(total=false) {
      let raccoon = $('#sudokuWinText')
      raccoon.remove()
      raccoon.style.display = 'none'
      sudokuContainer.appendChild(raccoon)
      board.style.display = 'grid'
      SUDOKU.sync()
      total? SUDOKU.clear(): SUDOKU.clearGuesses()
    },
    'solve': function() {
      if (SUDOKU.matrix.some(x => (x !== null)) && board.style.display !== 'block') {
        SUDOKU.solveSync(1)
      }
    }
  }
  let id = event.target.id
  if (map[id]) { map[id]() }
}



document.addEventListener(
  'mousedown',
  activateCell
)
document.addEventListener(
  'keydown',
  keyToMouse
)
keyboard.addEventListener(
  'mousedown',
  changeCellValue
)
commandBoard.addEventListener(
  'click',
  commandHandle
)

SUDOKU.main(100, 40)
// SUDOKU.sync()




// old                                                                        3012мс
// sets are replaced by arrays                                                1765мс
// sol call times 50_000-500_000 for SUDOKU.main
 
// Потестить скорость каждой из этих злотраханных функций и найти предателя
// отмечать точные варианты
// отмечать сомнительные варианты
// кнопка генерации, при обновлении не должно сбрасываться
// Убрать выделение мышью с клеток
// Перемещение указателя с клавы
// Чтобы убрирать и добавлять енота нужны отдельные функции
// Заменить енота на фейерверки
//Решение судоку должно стирать все пользовательские цифры и заполнять заново
