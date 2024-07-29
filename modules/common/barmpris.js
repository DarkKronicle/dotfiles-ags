const BarMprisProgress = () => {

    var lastUpdate = -1
    var lastPosition = -1
    var lastLength = -1

    const _updateProgress = (circprog) => { // Set circular progress value
        return
        const player = getPlayer(Mpris)
        if (player == null || player.length < 0) {
            lastUpdate = -1
            lastPosition = -1
            circprog.css = `font-size: 0px;`
            return
        }
        if (player.playBackStatus != 'Playing') {
            lastUpdate = -1
        } else {
            lastUpdate = Date.now()
        }
        lastPosition = player.position
        lastLength = player.length
        const progress = lastPosition /lastLength
        circprog.css = `font-size: ${Math.ceil(100 * progress)}px;`
    }

    const _interpolate = (circprog) => {
        return
        if (lastUpdate < 0) {
            return
        }
        const progress = (lastPosition + ((Date.now() - lastUpdate) / 1000)) / lastLength
        circprog.css = `font-size: ${Math.ceil(100 * progress)}px;`
    }

    return AnimatedCircProg({
        className: 'bar-indicator-circprog',
        vpack: 'center', hpack: 'center',
        extraSetup: (self) => {
            self.hook(Mpris, _updateProgress)
            self.poll(1000, _interpolate)
        },
    })
}

const BarMpris = () => Widget.Box({
    className: 'spacing-h-4',
    children: [
        Widget.Revealer({
            revealChild: false,
            setup: (self) => self.hook(Mpris, (self) => {
                return
                const mpris = Mpris.players
                self.revealChild = mpris.length > 0
            }),
            child: Widget.Overlay({
                child: Widget.Box({
                    vpack: 'center',
                    hpack: 'center',
                    className: 'bar-mpris',
                    homogeneous: true,
                    children: [
                        Widget.Label({
                            className: 'icon-material txt-small',
                            label: 'pause',
                            setup: (self) => self.hook(Mpris, label => {
                                return
                                const player = getPlayer(Mpris)
                                if (player == null) {
                                    return
                                }
                                if (player.playBackStatus == 'Playing') {
                                    self.label = "pause"
                                } else {
                                    self.label = "play_arrow"
                                }
                            })
                        })
                    ],
                }),
                overlays: [
                    Widget.Revealer({
                        revealChild: true,
                        child: BarMprisProgress(),
                        setup: (self) => self.hook(Mpris, (self) => {
                            return
                            const player = getPlayer(Mpris)
                            self.revealChild = player != null && player.length > -1
                        })
                    })
                ]
            })
        })
    ]
})
