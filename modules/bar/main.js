import Indicator from './components/indicator.js';
import SwayWorkspaces from './components/sway.js';

export const Bar = (/** @type {number} */ monitor) => {
    const SideModule = (children) => Widget.Box({
        className: 'bar-sidemodule',
        children: children,
        vertical: true
    })

    const barContent = Widget.CenterBox({
        className: 'bar-bg',
        vertical: true,
        startWidget: SideModule([SwayWorkspaces()]),
        endWidget: SideModule([Indicator()]),
        centerWidget: Widget.EventBox({
            vexpand: true,
            onPrimaryClick: () => {
                App.toggleWindow('paneleft')
            },
            css: "min-width: 2px;",
            child: Widget.Label({ label: "HI" })
        })
    });

    return Widget.Window({
        monitor,
        name: `bar${monitor}`,
        anchor: ['left', 'top', 'bottom'],
        exclusivity: 'exclusive',
        child: barContent
    })
}
