'use strict'

class Base {
  constructor(answers, questions) {
    let keys = Object.keys(answers)
    this.testAmount = keys.length
    this.trueAmount = 0
    this.wrong = []
    this.answers = answers
    this.questions = questions
    this.state = {}
    for (let i = 0; i < keys.length; i++) {
      this.state[keys[i]] = {}
      this.state[keys[i]].guess = []
      this.state[keys[i]].done = false
    }
  }
  compare(id) {
    let type = this.answers[id].type
    let answer = this.answers[id].answer
    let guess = this.state[id].guess
    let result
    if (type === 'single' || type === 'multi') {
      result = this.compareMulti(guess, answer)
    }
    else if (type === 'order') {
      result = this.compareOrder(guess, answer)
    }
    if (result === false) {
      this.wrong.push(id)
    }
    return result
  }
  compareMulti(guess, answer) {
    const guessCopy = guess.slice()
    const answerCopy = answer.slice()
    guessCopy.sort((a, b) => a - b)
    answerCopy.sort((a, b) => a - b)
    return this.compareOrder(guessCopy, answerCopy)
  }
  compareOrder(guess, answer) {
    return guess.length === answer.length && guess.every((v, i) => v === answer[i])
  }
  addGuess(guess, id) {
    if (!this.state[id].guess.includes(guess)) {
      this.state[id].guess.push(guess)
    }
  }
  removeGuess(guess, id) {
    this.state[id].guess = this.state[id].guess.filter(v => v !== guess)
  }
  changeTrueAmount(number) {
    this.trueAmount += number
  }
}


const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const testList = $('#testList')
const timerArr = Array.from($$('.timer'))
const mistake = $('#mistake')
const observer = new IntersectionObserver(
  entries => lastHash = '#' + entries[0].target.id, {
    root: document,
    rootMargin: '0px',
    threshold: 0.7
  }
)
let addsArr = []
let BASE
let lastHash = '#'
let lastWidth = innerWidth
let lastTime = Date.now()


function dispatchAnswer(event) {
  if (event.target.classList.contains('answerSpan')) {
    const ev = new Event('click', {bubbles: true})
    event.target.parentElement.dispatchEvent(ev)
  }
}

function answerHandler(event) {
  const id = event.target.id.split('_').slice(0, 2).join('_')
  const guess = +event.target.getAttribute('data-value')
  if (event.target.classList.contains('answerContainer') && !BASE.state[id].done) {
    if (BASE.state[id].guess.includes(guess)) {
      BASE.removeGuess(guess, id)
      event.target.classList.remove('selected')
    }
    else {
      BASE.addGuess(guess, id)
      event.target.classList.add('selected')
    }
    if (BASE.answers[id].type === 'single') {
      giveAnswer(id)
    }
    else if (BASE.answers[id].type === 'multi'){
      toggleMark(id, false)
    }
    else if (BASE.answers[id].type === 'order') {
      toggleMark(id, true)
    }
  }
}

function buttonHandler(event) {
  if (event.target.classList.contains('answer') && !BASE.state[event.target.parentElement.parentElement.id].done) {
    giveAnswer(event.target.parentElement.parentElement.id)
  }
}

function giveAnswer(id) {
  const result = BASE.compare(id)
  BASE.changeTrueAmount(Number(result))
  BASE.state[id].done = true
  resultHandler(BASE.trueAmount, BASE.testAmount)
  attrHandler(result, id)
}

function resultHandler(trueAmount, testAmount) {
  const percent = trueAmount / testAmount * 100
  const rounded = Math.round(percent)
  const int = percent === rounded
  if (testAmount === 0 && testAmount === 0) {
    $('#result').textContent = 'Всё, тесты кончились'
  }
  else {
    $('#result').textContent = `Результат: ${trueAmount}/${testAmount} ${int ? '=' + rounded : '≈' + rounded}%`
    if (rounded >= 100) {
      $("#raccoonContainer").style.display = 'block'
    }
  }
}

function attrHandler(result, id) {
  const li = $(`#${id}`)
  const children = Array.from(li.querySelectorAll('.answerContainer'))
  const type = BASE.answers[id].type
  const answerArr = BASE.answers[id].answer
  const guessArr = BASE.state[id].guess
  for (let i = 0; i < children.length; i++) {
    const value = +children[i].getAttribute('data-value')
    children[i].removeAttribute('tabindex')
    children[i].classList.remove('hover')
    if (type === 'single' || type === 'multi') {
      if (answerArr.includes(value)) {
        children[i].classList.add('darkGreen')
      }
      else if (guessArr.includes(value) && !answerArr.includes(value)) {
        children[i].classList.add('darkRed')
      }
    }
    else if (type === 'order') {
      let val = +children[i].getAttribute('data-value')
      if (guessArr.indexOf(val) !== -1 && answerArr.indexOf(val) === guessArr.indexOf(val)) {
        children[i].classList.add('darkGreen')
      }
      else {
        children[i].classList.add('darkRed')
      }
    }
  }
  if (result) {
    li.classList.add('darkGreenBorder')
  }
  else {
    li.classList.add('darkRedBorder')
    if (type === 'order') {
      const div = document.createElement('div')
      const span = document.createElement('span')
      div.classList.add('orderContainer')
      div.textContent = 'Правильный порядок: '
      span.classList.add('order')
      span.textContent = answerArr.map(n => li
        .querySelector(`[data-value="${n}"]`)
        .querySelector('.answerLetter')
        .textContent[0]).join(', ')
      div.appendChild(span)
      li.insertBefore(div, li.querySelector('.buttonContainer'))
    }
  }
}

function toggleMark(id, ordered) {
  const children = Array.from($(`#${id}`).querySelectorAll('.answerContainer'))
  const guess = BASE.state[id].guess
  for (let i = 0; i < children.length; i++) {
    const span = children[i].querySelector('.answerMark')
    if (!children[i].classList.contains('selected')) {
      span.textContent = ''
    }
    else if (ordered) {
      span.textContent = '|' + guess.indexOf(+children[i].getAttribute('data-value'))
    }
    else {
      span.textContent = '+'
    }
  }
}

function keyHandler(event) {
  const answerContainer = $('.answerContainer:focus')
  if (event.key === 'Enter' && answerContainer) {
    const newEvent = new Event('click', {bubbles: true})
    answerContainer.dispatchEvent(newEvent)
  }
}

function getLetter(num) {
  return String.fromCodePoint(num % 26 + 97)
}

function activeFocusEtc(event) {
  const target = event.target
  const type = event.type
  if (target.id === 'home') {
    homeFocus(type)
    event.preventDefault()
  }
  else if (target.tagName === 'A') {
    preventFocus(target, type)
    activeHandler(target, type)
  }
  else if (target.classList.contains('answerContainer') || target.classList.contains('answer')) {
    preventFocus(target, type)
  }
  else if (target.parentElement && target.parentElement.classList.contains('answerContainer')) {
    preventFocus(target.parentElement, type)
  }
}

function activeHandler(el, type) {
  if (type === 'mousedown') {
    el.classList.add('active')
  }
  else if (type === 'mouseup' || type === 'mouseout') {
    el.classList.remove('active')
  }
}

function preventFocus(el, type) {
  if (type === 'mousedown') {
    el.classList.remove('focus')
  }
  else if (type === 'mouseup' || type === 'mouseout') {
    el.blur()
    el.classList.add('focus')
  }
}

function homeFocus(type) {
  if (type === 'mousedown') {
    $('g').setAttribute('fill', '#5c0000')
  }
  else if (type === 'mouseover') {
    $('g').setAttribute('fill', '#900000')
  }
  else if (type === 'mouseup' || type === 'mouseout') {
    $('g').setAttribute('fill', '#fff')
  }
}

function tryHarder() {
  let keys = Object.keys(BASE.answers)
  let mistakeArr = []
  let raccoonContainer = $("#raccoonContainer")
  raccoonContainer.style.display = 'none'
  for (let i = 0; i < BASE.wrong.length; i++) {
    let el = resetLi($(`#${BASE.wrong[i]}`))
    mistakeArr.push(el)
  }
  testList.innerHTML = ''
  for (let i = 0; i < mistakeArr.length; i++) {
    testList.appendChild(mistakeArr[i])
  }
  if (mistakeArr.length === 0) {
    let div = document.createElement('div')
    let img = document.createElement('img')
    div.classList.add('info')
    div.textContent = 'Ошибок нет, круто'
    testList.appendChild(div)
    testList.style.minHeight = '0'
    raccoonContainer.innerHTML = ''
    raccoonContainer.style.display = 'block'
    img.src = '../images/cat.gif'
    img.alt = 'Кот'
    img.id = 'cat'
    raccoonContainer.appendChild(img)
  }
  BASE.testAmount = BASE.wrong.length
  BASE.trueAmount = 0
  BASE.wrong = []
  for (let i = 0; i < keys.length; i++) {
    BASE.state[keys[i]].done = false
    BASE.state[keys[i]].guess = []
  }
  if ($$('.timer').length) {
    Array.from($$('.timer')).map(el => el.textContent = 'Прошло: 00:00:00')
    lastTime = Date.now()
  }
  location.hash = '#'
  lastHash = '#'
  resultHandler(BASE.trueAmount, BASE.testAmount)
}

function resizeHandler() {
  if (lastWidth !== innerWidth) {
    location.hash = lastHash
    lastWidth = innerWidth
  }
}

function resetLi(li) {
  let answerArr = Array.from(li.children).filter(e => e.classList.contains('answerContainer'))
  li.classList.remove('darkRedBorder')
  li.classList.remove('darkGreenBorder')
  for (let i = 0; i < answerArr.length; i++) {
    answerArr[i].classList.remove('selected')
    answerArr[i].classList.remove('darkRed')
    answerArr[i].classList.remove('darkGreen')
    answerArr[i].classList.add('hover')
    answerArr[i].querySelector('.answerMark').textContent = ''
  }
  if (li.querySelector('.orderContainer')) {
    li.querySelector('.orderContainer').remove()
  }
  return li
}

function replaceTestList(addsAfterN) {
  testList.innerHTML = makeTestList(addsAfterN)
}

function makeTestList(addsAfterN=Infinity) {
  return makeList(BASE.questions, arr => arr, addsAfterN)
}

function makeRandomTestList(addsAfterN=Infinity) {
  return makeList(BASE.questions, shuffle, addsAfterN)
}

function makeList(questions, func, addsAfterN) {
  let stringHTML = []
  let addsIndex = 0
  for (let i = 0; i < questions.length; i++) {
    stringHTML.push(makeLi(questions[i], i, func))
    if ((i + 1) % addsAfterN === 0) {
      let addsStr = 
` <li class="addContainer noMarginInline noMarginInline">
    ${addsArr[addsIndex]}
  </li>`
      stringHTML.push(addsStr)
      addsIndex = (addsIndex + 1) % addsArr.length
    }
  }
  return stringHTML.join('')
}

function makeLi(question, i, func) {
  let id = question.id
  let arr = question.arr
  let string = `
<li class="testContainer" id="${id}">`
  let header = arr[0].split('\n')
  if (header.length === 1) {
    string += `<h2>
    ${i + 1}. ${header[0]}
  </h2>`
  }
  else {
    string += `<h2 class="paddingLeft">
    ${header[0]}
  </h2>`
    string += `<h2 class="noPaddingTop">
    ${i + 1}. ${header[1]}
  </h2>`
  }
  const toShuffle = []
  for (let j = 1; j < arr.length; j++) {
    toShuffle.push(`
  <div class="answerContainer focus hover" id="${id}_${j - 1}" data-value="${j - 1}" tabindex="0">
    <span class="answerSpan answerLetter"></span>
    <span class="answerSpan answerText">${arr[j]}</span>
    <span class="answerSpan answerMark"></span>
  </div>`)
  }
  string += func(toShuffle).map((v, k) => v.replace(/(answerLetter">)/, `$1${getLetter(k)}) `)).join('')
  if (BASE.answers[id].type !== 'single') {
    string += `
  <div class="buttonContainer">
    <button class="answer" id="b_${i}">Ответить</button>
  </div>`
  }
  string += `
</li>`
  return string
}

function choose(arr, amount) {
  const total = arr.length
  const numArr = randomNumArr(amount, 0, total)
  const testArr = []
  for (let i of numArr) {
    testArr.push(arr[i])
  }
  return testArr
}

function randomNumArr(amount, from, to) {
  if (amount > to - from) {
    return null
  }
  const arr = []
  while (arr.length < amount) {
    const n = Math.floor(Math.random() * (to - from)) + from
    if (!arr.includes(n)) {
      arr.push(n)
    }
  }
  return arr
}

function shuffle(a) {
  const len = a.length
  const arr = a.slice()
  for (let i = 0; i < len; i++) {
    const randIndex = Math.floor(Math.random() * (len - i) + i)
    const randVal = arr[randIndex]
    arr[randIndex] = arr[i]
    arr[i] = randVal
  }
  return arr
}

function timer() {
  const dif = Math.floor((Date.now() - lastTime) / 1000)
  const h = String(Math.floor(dif / 3600))
  const m = String(Math.floor((dif - 3600*h) / 60))
  const s = String(dif - 3600*h - 60*m)
  const str = `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`
  for (let t of timerArr) {
    t.textContent = 'Прошло: ' + str
  }
}


Promise.all([fetch(`../json/${sectionName}.json`), fetch(`../json/adds.json`)])
  .then(values => {
    return Promise.all(values.map(v => v.json()))
  }).then(([tests, adds]) => {
    BASE = new Base(tests.answers, tests.questions)
    addsArr = adds
    if (random) {
      const timerInterval = setInterval(timer, 1000)
      BASE.testAmount = testAmount
      testList.innerHTML = makeRandomTestList(choose(BASE.questions, testAmount))
    }
    resultHandler(BASE.trueAmount, BASE.testAmount)
    const list = $$('.testContainer')
    for (let li of list) {
      observer.observe(li)
    }
  })


document.addEventListener(
  'mousedown',
  activeFocusEtc
)
document.addEventListener(
  'mouseup',
  activeFocusEtc
)
document.addEventListener(
  'mouseout',
  activeFocusEtc
)
document.addEventListener(
  'mouseover',
  activeFocusEtc
)
window.addEventListener(
  'resize',
  resizeHandler
)
document.addEventListener(
  'keydown',
  keyHandler
)
testList.addEventListener(
  'click',
  dispatchAnswer
)
testList.addEventListener(
  'click',
  answerHandler
)
testList.addEventListener(
  'click',
  buttonHandler
)
mistake.addEventListener(
  'click',
  tryHarder
)

/*
Добавить все тесты:
  геникология
  прак навыки по терапии и тд с вариантами ответов и 
  с пояснениями после ответа
  дерма

Если тест не трогали, он должен считаться неправильным в работе над ошибками

Пересмотреть методы Base

Методы доступа к переменным Base?

Разделить тесты по фт и фх на занятия?

Нормальные названия разделов. И вообще нормальные названия всего. 
И переменных и классов и тд. Стили тоже

Поиск в браузере и индексация

В конце сверить ВСЕ ответы
Только, сука, попробуй удалить предыдущую строчку
                                                  ^^
                                                 (**)
                                                 <()>
                                                  /\


Уголки у домика закруглить. Сделать саму картинку ссылкой

Самый, сука, важный вопрос во всём этом плане, надёжном как швейцарские часы:
Как, блядь, заставить рекламу от третей по уёбищности IT организации в Росии
(После сайта Госуслуг и майл ру) работать, когда она добавлена через JS?
Загадка от Жака Фреско, нахуй

gif мягче

правило понижения абстракции

Написать тесты для каждой функции

Сократить объём кода, если возможно
*/
