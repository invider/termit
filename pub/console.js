/*
 * Web Terminal Emulator
 * License: MIT
 */
var con = (function(window) {

'use strict'

const BLINK = 300
const TARGET = 'ws://' + window.location.host + window.location.pathname + 'channel'

let focused= true
let PROMPT = '&gt; '
//let OUT = '&lt; '
let OUT = ''
let ws
let con
let buffer = ""
let command = ""
let queue = []
let blinking = false
let lastUpdate = Date.now()

/*
function expand() {
    var c = document.getElementById('console')
    //var newWidth = window.innerWidth
    //var newHeight = window.innerHeight
    //c.style.width = newWidth
    //c.style.height = newHeight
}
this.addEventListener('resize', expand, false)
*/

function openSocket(target) {
    let ws = new WebSocket(target)

    ws.onopen = function() {};

    ws.onmessage = function (e) {
        var msg = e.data;
        if (msg.length > 0) {
            println(OUT + msg.toString())
            prompt()
        } else {
            prompt()
        }
    };

    ws.onerror = function(e) {
        console.dir(e)
        console.log('[error] ')
        unfocus()
    }

    ws.onclose = function(e) { 
        console.dir(e)
        console.log('[closed]')
        unfocus()
    };

    return ws
}

window.onload = function load() {
    con = document.getElementById('console')
    console.log('Accessing console @' + TARGET)
    ws = openSocket(TARGET)
    //expand()
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
        con.innerHTML += String.fromCharCode(0x258A)
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
    print(msg + '\n')
}

function cemit(c) {
    command += c
    emit(c)
}

function sendQueue() {
    if (ws.readyState === WebSocket.OPEN) {
        for (let i = 0; i < queue.length; i++) {
            ws.send(queue[i])
        }
        queue.length = 0
    } else if (ws.readyState === WebSocket.CONNECTING) {
        // not ready - queue and reschedule
        if (sendQueue.length < 3) setTimeout(sendQueue, 1000)
    } else if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
        ws = openSocket(TARGET)
        if (sendQueue.length < 3) setTimeout(sendQueue, 1000)
    }
}

function cmd() {
    if (command.length > 0) {
        queue.push(command)
        command = ""
    }
    sendQueue()
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
        e.preventDefault()
        e.stopPropagation()
        return false
    }

    return true
})


return {
    unfocus: unfocus,
    focus: focus,
}

})(this)
