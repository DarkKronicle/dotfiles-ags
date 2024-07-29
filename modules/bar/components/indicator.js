import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import SystemTray from 'resource:///com/github/Aylur/ags/service/systemtray.js';
const { execAsync } = Utils;
import Indicator from '../../../services/indicator.js';
import { StatusIcons } from '../../common/statusicons.js';
import { Tray } from "./tray.js";
import Clock from "./clock.js";

const SeparatorDot = () => Widget.Revealer({
    transition: 'slide_left',
    revealChild: false,
    attribute: {
        'count': SystemTray.items.length,
        'update': (self, diff) => {
            self.attribute.count += diff;
            self.revealChild = (self.attribute.count > 0);
        }
    },
    child: Widget.Label({
        className: 'bar-indicator txt-small slightly-right icon-material',
        label: "keyboard_arrow_up",
    }),
    setup: (self) => self
        .hook(SystemTray, (self) => self.attribute.update(self, 1), 'added')
        .hook(SystemTray, (self) => self.attribute.update(self, -1), 'removed')
    ,
});

const clockEmptyArea = () => Widget.Box({
    className: 'bar-clock-surround',
});

export default () => {
    var revealTray = Variable(false)
    const barTray = Widget.Revealer({
        revealChild: revealTray.bind(),
        child: Tray(),
    });
    const barStatusIcons = StatusIcons({
        className: 'bar-statusicons',
    });
    const TrayToggle = (child) => Widget.EventBox({
        onPrimaryClick: () => revealTray.value = !revealTray.value,
        child: child,
    });
    const SpaceRightDefaultClicks = (child) => Widget.EventBox({
        // onPrimaryClick: () => App.toggleWindow('sideright'),
        onSecondaryClick: () => execAsync(['bash', '-c', 'playerctl next || playerctl position `bc <<< "100 * $(playerctl metadata mpris:length) / 1000000 / 100"` &']).catch(print),
        onMiddleClick: () => execAsync('playerctl play-pause').catch(print),
        setup: (self) => self.on('button-press-event', (self, event) => {
            if (event.get_button()[1] === 8)
                execAsync('playerctl previous').catch(print)
        }),
        child: child,
    });
    const emptyArea = Widget.Box({ vexpand: true, vertical: true, });
    const actualContent = Widget.Box({
        vertical: true,
        vexpand: true,
        hpack: 'center',
        className: 'spacing-v-5 bar-spaceright',
        children: [
            emptyArea,
            barTray,
            TrayToggle(SeparatorDot()),
            SpaceRightDefaultClicks(barStatusIcons),
            clockEmptyArea(), // Add just a bit of bottom padding
            Clock(),
            clockEmptyArea(), // Add just a bit of bottom padding
        ],
    });

    return Widget.EventBox({
        onScrollUp: () => {
            if (!Audio.speaker) return;
            if (Audio.speaker.volume <= 0.09) Audio.speaker.volume += 0.01;
            else Audio.speaker.volume += 0.03;
            Indicator.popup(1);
        },
        onScrollDown: () => {
            if (!Audio.speaker) return;
            if (Audio.speaker.volume <= 0.09) Audio.speaker.volume -= 0.01;
            else Audio.speaker.volume -= 0.03;
            Indicator.popup(1);
        },
        child: Widget.Box({
            vertical: true,
            children: [
                actualContent,
                // Don't need this cause no corner rounding, just adds some unnecessary space
                // RightDefaultClicks(Widget.Box({ className: 'bar-corner-spacing' })),
            ]
        }),
    });
}
