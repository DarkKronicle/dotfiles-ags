import Indicator from './components/indicator.js';
import SwayWorkspaces from './components/sway.js';
import Clock from "./components/clock.js";

const topContent = () => {
    var lastToggle = 0;
    
    return Widget.Box({
        vertical: true,
        children: [
            Widget.EventBox({
                onPrimaryClick: () => {
                    const now = Date.now();
                    const diff = now - lastToggle;
                    if (diff > 50) {
                        App.toggleWindow('paneleft')
                    }
                    lastToggle = now;
                },
                child: Clock(),
            }),
            SwayWorkspaces(),
        ]
    })
}

export const Bar = (/** @type {number} */ monitor) => {
    const SideModule = (children) => Widget.Box({
        className: 'bar-sidemodule',
        children: children,
        vertical: true
    })

    const barContent = Widget.CenterBox({
        className: 'bar-bg',
        vertical: true,
        startWidget: SideModule([topContent()]),
        endWidget: SideModule([Indicator()]),
    });

    var lastToggle = 0;

    return Widget.Window({
        monitor,
        name: `bar${monitor}`,
        anchor: ['left', 'top', 'bottom'],
        exclusivity: 'exclusive',
        child: barContent
    })
}
