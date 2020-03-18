'use strict'

const canvas = document.querySelector('#snake-canvas')
const ctx = canvas.getContext('2d')

resizeCanvas()

/**
 * The tangent at which the next move will be made. This value is controlled
 * by the device's motion data, or the keyboard arrow keys.
 */
let heading = 0

/**
 * A sort of 'tick' value that's incremented every cycle, although it can
 * also be decreased when the snake eats either an apple or a berry.
 */
let score = 0

let journey = []

clearCanvas()
writeText('Tap anywhere to start.')

onClick(startGame)

async function startGame() {
  heading = 0
  journey = []
  score = 0


  let x1 = canvas.width / 2
  let y1 = canvas.height / 2

  let cpx = x1 - scale(1)
  let cpy = y1

  let x2 = x1 - scale(2)
  let y2 = y1

  let t = 0

  journey.push({ x1, y1, cpx, cpy, x2, y2 })

  clearCanvas()
  let applePos = spawnApple()

  while (true) {
    let { x1, y1, cpx, cpy, x2, y2 } = journey[0]

    cpx = x1 + x1 - cpx
    cpy = y1 + y1 - cpy

    const dx = x1 - cpx
    const dy = y1 - cpy
    const dO = Math.PI - heading

    x2 = cpx + dx * Math.cos(dO) - dy * Math.sin(dO)
    y2 = cpy + dx * Math.sin(dO) + dy * Math.cos(dO)

    journey.unshift({ x1: x2, y1: y2, cpx, cpy, x2, y2 })

    if (x2 < 0 || canvas.width < x2 || y2 < 0 || canvas.height < y2) {
      return writeText('Game over!') || onClick(startGame)
    }

    if (Math.sqrt((applePos.x - x2) ** 2 + (applePos.y - y2) ** 2) <= scale(4)) {
      console.log("eat")
    }
    /**
     * Draw the trail
     */
    if (score + scale(40) < journey.length) {
      const { x1, y1, cpx, cpy, x2, y2 } = journey.pop()

      ctx.lineWidth = scale(16)
      ctx.strokeStyle = '#bcf8e8'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.quadraticCurveTo(cpx, cpy, x2, y2)
      ctx.stroke()
    }

    /**
     * Draw the snake
     */
    {
      const { x1, y1, cpx, cpy, x2, y2 } = journey[0]

      ctx.lineWidth = scale(14)
      ctx.strokeStyle = '#420016'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.quadraticCurveTo(cpx, cpy, x2, y2)
      ctx.stroke()
    }

    writeScore()

    await wait(16);
  }
}

document.body.onclick = () => {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then((state) => {
      if (state === 'granted') {
        setupDeviceMotion()
      } else {
        // Todo: Handle error state
      }
    })
  } else {
    setupDeviceMotion()
  }
}


/**
 * Gyro support
 */

function setupDeviceMotion() {
  window.addEventListener('deviceorientation', (evt) => {
    const phoneVectorX = evt.gamma;
    const phoneVectorY = evt.beta;

    let { x1, y1, x2, y2 } = journey[0]

    const snakeVectorX = x2 - x1
    const snakeVectorY = y2 - y1

    heading = Math.atan2(phoneVectorY - snakeVectorY, phoneVectorX - snakeVectorX)
    console.log(heading)
  })
}

/**
 * Keyboard support
 */
window.addEventListener('keydown', (evt) => {
  if ([37, 65].includes(evt.keyCode)) {
    return heading = .07
  }

  if ([39, 68].includes(evt.keyCode)) {
    return heading = -.07
  }
}, false)

window.addEventListener('keyup', (evt) => {
  if ([37, 39, 65, 68].includes(evt.keyCode)) {
    return heading = 0
  }
}, false)

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function resizeCanvas() {
  const width = innerWidth * 0.93
  const height = width / 16 * 9

  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  canvas.width  = scale(width)
  canvas.height = scale(height)
}

function clearCanvas() {
  ctx.fillStyle = '#b5ffec'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function writeScore() {
  ctx.font = `700 ${scale(16)}px Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace`
  ctx.fillStyle = '#000'
  ctx.textAlign = 'left'
  ctx.fillText(score, scale(20), scale(36))
}

function writeText(text) {
  const { width, height } = canvas

  const boxWidth = scale(text.length * 12)
  const boxHeight = scale(60)
  const boxPosX = width / 2 - boxWidth / 2
  const boxPosY = height / 2 - boxHeight / 2

  ctx.lineWidth = scale(2)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#000'

  ctx.rect(boxPosX, boxPosY, boxWidth, boxHeight)

  ctx.fill()
  ctx.stroke()

  ctx.font = `700 ${scale(16)}px Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace`
  ctx.fillStyle = '#000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)
}

function spawnApple() {
  const x = Math.random() * canvas.width
  const y = Math.random() * canvas.height

  ctx.fillStyle = '#ff3838'
  ctx.fillRect(x, y, scale(10), scale(10))

  return { x, y }
}

function spawnBug() {

}

function onClick(fn) {
  canvas.onclick = () => {
    canvas.onclick = null
    fn()
  }
}

function scale(n) {
  return n * devicePixelRatio
}
