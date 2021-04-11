/*
 * Web Terminal Emulator
 * License: MIT
 */
var con = (function(window) {

'use strict'

const BLINK = 300

let focused = true
let PROMPT = '&gt; '
let CURSOR = 0x258A
//let OUT = '&lt; '
let OUT = ''
let con
let buffer = ""
let command = ""
let queue = []
let blinking = false
let lastUpdate = Date.now()
let handler = null

function expand() {
    var c = document.getElementById('console')
    var newWidth = window.innerWidth
    var newHeight = window.innerHeight
    c.style.width = newWidth
    c.style.height = newHeight
}
window.addEventListener('resize', expand, false)

window.onload = function load() {
    con = document.getElementById('console')
    expand()
    prompt()
}

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
        con.innerHTML += String.fromCharCode(CURSOR)
    }
}

function bcur(buf) {
    blinking = true
    if (focused) {
        con.innerHTML = buf + '<span class="blink">'
            + String.fromCharCode(0x258A) + '</span>'
    } else {
        con.innerHTML = buf
    }
}

function prompt() {
    if (PROMPT) print(PROMPT)
}

// synchronize buffer with console div
function sync() {
    con.innerHTML = buffer
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
    if (con.scrollTop + con.clientHeight + 12 < con.scrollHeight) {
        con.scrollTop = con.scrollHeight;
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
    //print(msg + '\n')
    print(msg + '\n')
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
                cemit('\n')
            } else {
                emit('\n')
                cmd()
            }
        } else if (e.ctrlKey) {
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
    handler.console = api
    if (handler.init) handler.init()
}

const api = {
    expand: expand,
    unfocus: unfocus,
    focus: focus,
    setHandler: setHandler,
    getQueue: function() {
        return queue
    },

    print: print,
    println: println,
    prompt: prompt,
}

return api

})(this)
