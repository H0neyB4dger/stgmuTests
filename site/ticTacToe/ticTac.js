'use strict'

class Bot {
  #BotFigure
  #clientFigure
  #difficulty
  constructor(figure='0', difficulty=0.75) {
    this.#BotFigure = figure
    this.#clientFigure = figure === '0'? 'x': '0'
    this.#difficulty = difficulty
  }

  getBotFigure() {
    return this.#BotFigure
  }

  makeMove(gameState) {
    let temporaryGameState = gameState.copy()
    let { row, col } = this.#chooseMove(temporaryGameState)
    return { row, col }
  }

  #chooseMove(gameState) {
    let move = Math.random() > this.#difficulty? 
      this.#randomMove(gameState): this.#idealMove(gameState)
    return { row: move.row, col: move.col }
  }

  #idealMove(gameState) {
    let emptyCells = gameState.getEmptyCells()
    let bestOption = { row: null, col: null, score: -Infinity }
    for (let { row, col } of emptyCells) {
      gameState.setCell(row, col, this.#BotFigure)
      if (gameState.getWinState().winner === this.#BotFigure) {
        bestOption = { row, col, score: 10 }
      }
      else if (!gameState.hasEmptyCell() && 0 > bestOption.score) {
        bestOption = { row, col, score: 0 }
      }
      else {
        let score = this.#idealClientMove(gameState).minScore
        if (score > bestOption.score) {
          bestOption = { row, col, score }
        }
      }
      gameState.setCell(row, col, null)
    }
    return { row: bestOption.row, col: bestOption.col, maxScore: bestOption.score }
  }

  #idealClientMove(gameState) {
    let emptyCells = gameState.getEmptyCells()
    let bestOption = { row: null, col: null, score: Infinity }
    for (let { row, col } of emptyCells) {
      gameState.setCell(row, col, this.#clientFigure)
      if (gameState.getWinState().winner === this.#clientFigure) {
        bestOption = { row, col, score: -10 }
      }
      else if (!gameState.hasEmptyCell() && 0 < bestOption.score) {
        bestOption = { row, col, score: 0 }
      }
      else {
        let score = this.#idealMove(gameState).maxScore
        if (score < bestOption.score) {
          bestOption = { row, col, score }
        }
      }
      gameState.setCell(row, col, null)
    }
    return { row: bestOption.row, col: bestOption.col, minScore: bestOption.score }
  }

  #randomMove(gameState) {
    let emptyCells = gameState.getEmptyCells()
    let randIndex = randRange(0, emptyCells.length)
    let { row, col } = emptyCells[randIndex]
    return { row, col }
  }
}

class GameState {
  #state
  #side
  constructor(state=Array(3).fill(null).map(v => Array(3).fill(null))) {
    this.#state = state
    this.#side = state.length
  }

  getSide() {
    return this.#side
  }

  hasEmptyCell() {
    return this.getEmptyCells().length !== 0
  }

  getEmptyCells() {
    let emptyCells = []
    for (let row = 0; row < this.#side; row++) {
      for (let col = 0; col < this.#side; col++) {
        if (this.isCellEmpty(row, col)) {
          emptyCells.push({row, col})
        }
      }
    }
    return emptyCells
  }

  isCellEmpty(row, col) {
    return this.getCell(row, col) === null
  }

  getCell(row, col) {
    return this.#state[row][col]
  }

  setCell(row, col, value) {
    this.#state[row][col] = value
  }

  getWinState() {
    let downDiag = []
    let upDiag = []
    let lastIndex = this.#side - 1
    for (let i = 0; i < this.#side; i++) {
      downDiag.push(this.#state[i][i])
      upDiag.push(this.#state[i][lastIndex - i])
      if (this.#state[i].every(v => v === 'x') || this.#state[i].every(v => v === '0')) {
        return { 
          winner: this.#state[i][0], 
          line: `horizontal_${i}`
        }
      }
      if (this.#state.every(v => v[i] === 'x') || this.#state.every(v => v[i] === '0')) {
        return {
          winner: this.#state[0][i],
          line: `vertical_${i}`
        }
      }
    }
    if (downDiag.every(v => v === 'x') || downDiag.every(v => v === '0')) {
      return {
        winner: this.#state[0][0],
        line: 'downDiag'
      }
    }
    if (upDiag.every(v => v === 'x') || upDiag.every(v => v === '0')) {
      return {
        winner: this.#state[0][2],
        line: 'upDiag'
      }
    }
    return {
      winner: null,
      line: null
    }
  }

  copy() {
    let matrix = copyMatrix(this.#state)
    let newGameState = new GameState(matrix)
    return newGameState
  }

  clear() {
    this.#state = Array(3).fill(null).map(v => Array(3).fill(null))
  }
}

class Synchronizer {
  #board
  #ongoing
  #gameState
  #side
  constructor(board, ongoing, gameState=new GameState()) {
    this.#board = board
    this.#ongoing = ongoing
    this.#gameState = gameState
    this.#side = this.#gameState.getSide()
  }

  fillBoard() {
    for (let row = 0; row < this.#side; row++) {
      for (let col = 0; col < this.#side; col++) {
        let div = document.createElement('div')
        div.id = `cell_${row}_${col}`
        div.classList.add('cell')
        this.#board.appendChild(div)
      }
    }
  }

  sync(winState={ winner: null, cells: [], line: null }) {
    this.#crossesAndZeros()
    this.#drowLine(winState)
    this.#whatsGoingOn(winState)
  }

  #crossesAndZeros() {
    for (let row = 0; row < this.#side; row++) {
      for (let col = 0; col < this.#side; col++) {
        let figure = this.#gameState.getCell(row, col)
        let cell = $(`#cell_${row}_${col}`)
        if (figure === 'x') {
          cell.classList.add('cross')
        }
        else if (figure === '0') {
          cell.classList.add('zero')
        }
        else {
          cell.classList.remove('cross')
          cell.classList.remove('zero')
        }
      }
    }
  }

  #drowLine(winState) {
    if (winState.winner) {
      let line = document.createElement('div')
      line.classList.add('line')
      line.classList.add(winState.line)
      this.#board.appendChild(line)
    }
    else if ($('.line')) {
      $('.line').remove()
    }
  }

  #whatsGoingOn(winState) {
    if (winState.winner === 'x') {
      this.#ongoing.textContent = `Победитель "X"`
    }
    else if (winState.winner === '0') {
      this.#ongoing.textContent = `Победитель "0"`
    }
    else {
      this.#ongoing.textContent = `Игра идёт`
    }
  }
}

function copyMatrix(matrix) {
  let newMatrix = []
  for (let row = 0; row < matrix.length; row++) {
    newMatrix.push(matrix[row].slice())
  }
  return newMatrix
}

function randRange(floor, ceil) {
  let randNumber = Math.floor(Math.random() * (ceil - floor) + floor)
  return randNumber
}

function clientMove(event) {
  let [_, row, col] = event.target.id.split('_').map(v => Number(v))
  if (!GAME_STATE.isCellEmpty(row, col) || 
       GAME_STATE.getWinState().winner || 
       whoseTurn !== clientFigure) {
    return
  }
  GAME_STATE.setCell(row, col, clientFigure)
  let winState = GAME_STATE.getWinState()
  SYNCHRONIZER.sync(winState)
  whoseTurn = BOT.getBotFigure()
  if (!winState.winner && GAME_STATE.hasEmptyCell()) {
    BotMove()
  }
}

function BotMove() {
  let { row, col } = BOT.makeMove(GAME_STATE)
  GAME_STATE.setCell(row, col, BOT.getBotFigure())
  SYNCHRONIZER.sync(GAME_STATE.getWinState())
  whoseTurn = clientFigure
}

function restart() {
  GAME_STATE.clear()
  SYNCHRONIZER.sync()
  whoseTurn = clientFigure
}


const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const board = $('#board')
const restartButton = $('#restart')
const ongoing = $('#ongoing')
const clientFigure = 'x'
const GAME_STATE = new GameState()
const SYNCHRONIZER = new Synchronizer(board, ongoing, GAME_STATE)
const BOT = new Bot()
let whoseTurn = clientFigure


SYNCHRONIZER.fillBoard()
SYNCHRONIZER.sync(GAME_STATE.getWinState())

board.addEventListener(
  'click',
  clientMove
)
restartButton.addEventListener(
  'click',
  restart
)
// Отсечь всё лишнее
