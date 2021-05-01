var dumpHandler = {
    name: 'dump-handler',

    init: function() {
        console.log('initializing dump handler')
    },

    exec: function() {
        const term = this.term
        const queue = term.getQueue()

        for (let i = 0; i < queue.length; i++) {
            const cmd = queue[i]
            console.log('[' + cmd + ']')
            term.printout('' + cmd)
        }
        queue.length = 0
        term.prompt()
    },
}
