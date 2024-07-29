import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import { ExpandingIconTabContainer } from '../common/tabcontainer.js';
const { execAsync, exec } = Utils;

import ModuleNotificationList from './centermodules/notificationlist.js';
import ModuleWifiNetworks from './centermodules/wifinetworks.js';
import ModuleBluetooth from './centermodules/bluetooth.js';
import ModuleAudioControls from './centermodules/audiocontrols.js';


const centerWidgets = [
    {
        name: 'Notifications',
        materialIcon: 'notifications',
        contentWidget: ModuleNotificationList,
    },
    {
        name: 'Audio controls',
        materialIcon: 'volume_up',
        contentWidget: ModuleAudioControls,
    },
    {
        name: 'Bluetooth',
        materialIcon: 'bluetooth',
        contentWidget: ModuleBluetooth,
    },
    {
        name: 'Wifi networks',
        materialIcon: 'wifi',
        contentWidget: ModuleWifiNetworks,
        onFocus: () => execAsync('nmcli dev wifi list').catch(print),
    },
];

export const paneOptionsStack = ExpandingIconTabContainer({
    tabsHpack: 'center',
    tabSwitcherClassName: 'pane-icontabswitcher',
    icons: centerWidgets.map((api) => api.materialIcon),
    names: centerWidgets.map((api) => api.name),
    children: centerWidgets.map((api) => api.contentWidget()),
    onChange: (self, id) => {
        self.shown = centerWidgets[id].name;
        if (centerWidgets[id].onFocus) centerWidgets[id].onFocus();
    }
});


export default () => Widget.Box({
    vexpand: true,
    css: 'min-width: 2px;',
    children: [
        Widget.Box({
            vexpand: true,
            vertical: true,
            className: 'pane-left spacing-v-15',
            children: [
                Widget.Box({
                    className: 'pane-group',
                    children: [
                        paneOptionsStack

                    ],
                }),
            ],
        }),
    ],
})
