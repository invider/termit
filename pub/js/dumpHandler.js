var dumpHandler = {
    name: 'dump-handler',

    init: function() {
        console.log('initializing dump handler')
    },

    exec: function(cmd) {
        const term = this.term
        console.log('[' + cmd + ']')
        term.printout('' + cmd)
    },
}
