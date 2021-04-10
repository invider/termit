const TARGET = 'ws://' + window.location.host + window.location.pathname + 'channel'

function openSocket(target) {
    let ws = new WebSocket(target)

    ws.onopen = function() {};

    ws.onmessage = function (e) {
        var msg = e.data;
        if (msg.length > 0) {
            this.console.println(OUT + msg.toString())
            this.console.prompt()
        } else {
            this.console.prompt()
        }
    };

    ws.onerror = function(e) {
        console.dir(e)
        console.log('[error] ')
        this.console.unfocus()
    }

    ws.onclose = function(e) { 
        console.dir(e)
        console.log('[closed]')
        this.console.unfocus()
    };

    return ws
}

var socketHandler = {
    name: 'socket-handler',

    init: function() {
        console.log('Accessing console @' + TARGET)
        this.ws = openSocket(TARGET)
    },

    exec: function(cmd) {
        const ws = this.ws
        const queue = this.console.getQueue()

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
        sendQueue()
    },
}
