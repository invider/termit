var dumpHandler = {
    name: 'dump-handler',

    init: function() {
        console.log('initializing dump handler')
    },

    exec: function() {
        const con = this.console
        const queue = con.getQueue()

        for (let i = 0; i < queue.length; i++) {
            const cmd = queue[i]
            console.log('[' + cmd + ']')
            con.println('< ' + cmd)
        }
        queue.length = 0
        this.console.prompt()
    },
}
