/*
 * Web Terminal Emulator
 * License: MIT
 */
var term = (function(window) {

'use strict'

const BLINK = 300
const DEFAULT_THEME = 'dark'
const THEME_STORAGE = 'termit-theme'

let focused = true
let PROMPT = '&gt; '
//let CURSOR = 0x258A
//let OUT = '&lt; '
//let OUT = ''
let term
let buffer = ""
let command = ""
let queue = []
let blinking = false
let lastUpdate = Date.now()
let handler = null

const themes = [
    'default',
    'solar',
    'eclipse',
    'dark',
]

const env = {
    id:     'termit',
    //cursor: '_',
    cursor: String.fromCharCode(0x258A),
    out:    '',
    //out:  '&lt ',
}

const actions = {
    adjust: function() {
        var c = document.getElementById(env.id)
        if (!c) {
            throw `The element id="${env.id}" MUST be present in the document!`
        }
        var newWidth = window.innerWidth
        var newHeight = window.innerHeight
        c.style.width = newWidth
        c.style.height = newHeight
    },

    ctrl: {
        KeyZ: function() {
            // next theme
        }
    }
}

function setTheme(theme) {
    if (!theme || themes.indexOf(theme) < 0) {
        theme = DEFAULT_THEME
    }

    console.log('setting theme: ' + theme)
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE, theme)
}

function adjust() {
    actions.adjust()
}
window.addEventListener('resize', adjust, false)

window.addEventListener('load', () => {
    term = document.getElementById('termit')
    adjust()
    prompt()

    //const theme = localStorage.getItem(THEME_STORAGE)
    setTheme(DEFAULT_THEME)
})

// cursor blink updater
setInterval(function() {
    if (blinking) return
    if ((Date.now() - lastUpdate) > BLINK) {
        bcur(buffer)
    }
}, 100)

function cur() {
    blinking = false
    if (focused) {
        term.innerHTML += env.cursor
    }
}

function bcur(buf) {
    blinking = true
    if (focused) {
        term.innerHTML = buf + '<span class="blink">'
            + env.cursor + '</span>'
        /*
        term.innerHTML = buf + '<span class="blink">'
            + String.fromCharCode(0x258A) + '</span>'
            */
    } else {
        term.innerHTML = buf
    }
}

function prompt() {
    if (PROMPT) print(PROMPT)
}

// synchronize buffer with console div
function sync() {
    term.innerHTML = buffer
    cur()
}

// remove last symbol
function pop() {
    if (buffer.length < 1) return
    buffer = buffer.slice(0, -1)
}

// remove last symbol from the input line
function cpop() {
    if (command.length < 1) return
    command = command.slice(0, -1)
    pop()
}

function backspace() {
    cpop(); sync();
}

function scroll() {
    if (term.scrollTop + term.clientHeight + 12 < term.scrollHeight) {
        term.scrollTop = term.scrollHeight;
    }
}

function emit(c) {
    buffer += c
    sync()
    scroll()
}

function print(msg) {
    buffer += msg
    sync()
    scroll()
}

function println(msg) {
    print(msg + '\n')
}

function printout(msg) {
    print(env.out + msg + '\n')
}

function cemit(c) {
    command += c
    emit(c)
}

function cmd() {
    if (command.length > 0) {
        queue.push(command)
        command = ""
    }
    if (handler) {
        handler.exec()
    }
}

function ignoreEvent(e) {
    e.preventDefault()
    e.stopPropagation()
    return false
}

function focus(e) {
    focused = true
    blinking = true
    sync()
}

function unfocus(e) {
    if (e.target.id === 'console') return true
    focused = false
    blinking = false
}

window.addEventListener('keydown', function(e) {
    if (e.metaKey || e.altKey) return true

    if (focus) {
        if (e.keyCode === 27) {
            unfocus()
        } else if (e.keyCode === 13) {
            if (e.ctrlKey) {
                // multi-line input
                cemit('\n')
            } else {
                emit('\n')
                cmd()
            }
        } else if (e.ctrlKey) {
            const fn = actions.ctrl[e.code]
            if (fn) fn()
            return
        } else if (e.keyCode === 8) {
            backspace()
        } else {
            if (e.key.length === 1) {
                cemit(e.key)
            }
        }

        lastUpdate = Date.now()
        //e.preventDefault()
        //e.stopPropagation()
        return false
    }

    return true
})

function setHandler(h) {
    if (!h) throw 'handler is expected!'
    handler = h
    handler.term = api
    if (handler.init) handler.init()
}

const api = {
    unfocus: unfocus,
    focus: focus,
    setHandler: setHandler,
    setCursor: function(cur) {
        env.cursor = cur
    },
    getQueue: function() {
        return queue
    },

    print: print,
    println: println,
    printout: printout,
    prompt: prompt,
}

return api

})(this)
