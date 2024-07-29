const date = Variable("", {
    poll: [1000, 'date "+%H\n%M"'],
})

export default () => Widget.Label({
    hpack: 'center',
    className: 'bar-indicator bar-clock',
    label: date.bind()
})
