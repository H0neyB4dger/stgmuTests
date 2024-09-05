'use strict'

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const emblem = document.querySelector('#emblem')

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
if (emblem) {
  emblem.src = emblem.src + '?' + Date.now()
  emblem.addEventListener(
    'load',
    () => emblem.style.visibility = 'visible'
  )
}
