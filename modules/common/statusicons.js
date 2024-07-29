import App from 'resource:///com/github/Aylur/ags/app.js';
import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

import { MaterialIcon } from './materialicon.js';
import Bluetooth from 'resource:///com/github/Aylur/ags/service/bluetooth.js';
import Network from 'resource:///com/github/Aylur/ags/service/network.js';
import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';

const battery = await Service.import('battery')
import { AnimatedCircProg } from '../common/cairo_circularprogress.js'

const { execAsync, exec } = Utils;

export const BarResource = (name, icon, command, circprogClassName = 'bar-indicator-circprog', textClassName = 'txt-onSurfaceVariant', iconClassName = 'bar-batt') => {
    const resourceCircProg = AnimatedCircProg({
        className: `${circprogClassName}`,
        vpack: 'center',
        hpack: 'center',
    });
    const resourceProgress = Widget.Box({
        homogeneous: true,
        children: [Widget.Overlay({
            child: Widget.Box({
                vpack: 'center',
                hpack: 'center',
                className: `${iconClassName}`,
                homogeneous: true,
                children: [
                    MaterialIcon(icon, 'small'),
                ],
            }),
            overlays: [resourceCircProg]
        })]
    });
    const widget =  Widget.Box({
        className: `spacing-h-4 ${textClassName}`,
        children: [
            resourceProgress,
        ],
        setup: (self) => self.poll(5000, () => execAsync(['bash', '-c', command])
            .then((output) => {
                resourceCircProg.css = `font-size: ${Number(output)}px;`;
                widget.tooltipText = `${name}: ${Math.round(Number(output))}%`;
            }).catch(print))
        ,
    });
    return widget;
}

export const MicMuteIndicator = () => Widget.Revealer({
    revealChild: false,
    setup: (self) => self.hook(Audio, (self) => {
        self.revealChild = Audio.microphone?.stream?.isMuted;
    }),
    child: MaterialIcon('mic_off', 'norm'),
});

export const NotificationIndicator = (notifCenterName = 'sideright') => {
    const widget = Widget.Revealer({
        transition: 'slide_left',
        transitionDuration: 50,
        revealChild: false,
        setup: (self) => self
            .hook(Notifications, (self, id) => {
                if (!id || Notifications.dnd) return;
                if (!Notifications.getNotification(id)) return;
                self.revealChild = true;
            }, 'notified')
            .hook(App, (self, currentName, visible) => {
                if (visible && currentName === notifCenterName) {
                    self.revealChild = false;
                }
            })
        ,
        child: Widget.Box({
            children: [
                MaterialIcon('notifications', 'norm'),
                Widget.Label({
                    className: 'txt-small titlefont',
                    attribute: {
                        unreadCount: 0,
                        update: (self) => self.label = `${self.attribute.unreadCount}`,
                    },
                    setup: (self) => self
                        .hook(Notifications, (self, id) => {
                            if (!id || Notifications.dnd) return;
                            if (!Notifications.getNotification(id)) return;
                            self.attribute.unreadCount++;
                            self.attribute.update(self);
                        }, 'notified')
                        .hook(App, (self, currentName, visible) => {
                            if (visible && currentName === notifCenterName) {
                                self.attribute.unreadCount = 0;
                                self.attribute.update(self);
                            }
                        })
                    ,
                })
            ]
        })
    });
    return widget;
}

export const BluetoothIndicator = () => Widget.Stack({
    transition: 'slide_up_down',
    transitionDuration: 50,
    children: {
        'false': Widget.Label({ className: 'bar-indicator txt-norm slightly-right icon-material', label: 'bluetooth_disabled' }),
        'true': Widget.Label({ className: 'bar-indicator txt-norm slightly-right icon-material', label: 'bluetooth' }),
    },
    setup: (self) => self
        .hook(Bluetooth, stack => {
            stack.shown = String(Bluetooth.enabled);
        })
    ,
});

const BluetoothDevices = () => Widget.Box({
    vertical: true,
    className: 'spacing-v-5',
    setup: self => self.hook(Bluetooth, self => {
        self.children = Bluetooth.connected_devices.map((device) => {
            return Widget.Box({
                className: 'bar-indicator bar-bluetooth-device spacing-v-5',
                hpack: 'center',
                tooltipText: device.name,
                children: [
                    Widget.Icon(`${device.iconName}-symbolic`),
                    ...(device.batteryPercentage ? [Widget.Label({
                        className: 'txt-smallie',
                        label: `${device.batteryPercentage}`,
                        setup: (self) => {
                            self.hook(device, (self) => {
                                self.label = `${device.batteryPercentage}`;
                            }, 'notify::batteryPercentage')
                        }
                    })] : []),
                ]
            });
        });
        self.visible = Bluetooth.connected_devices.length > 0;
    }, 'notify::connected-devices'),
})

const NetworkWiredIndicator = () => Widget.Stack({
    transition: 'slide_up_down',
    transitionDuration: 50,
    children: {
        'fallback': SimpleNetworkIndicator(),
        'unknown': Widget.Label({ className: 'bar-indicator txt-norm icon-material', label: 'wifi_off' }),
        'disconnected': Widget.Label({ className: 'bar-indicator txt-norm icon-material', label: 'signal_wifi_off' }),
        'connected': Widget.Label({ className: 'bar-indicator txt-norm icon-material', label: 'lan' }),
        'connecting': Widget.Label({ className: 'bar-indicator txt-norm icon-material', label: 'settings_ethernet' }),
    },
    setup: (self) => self.hook(Network, stack => {
        if (!Network.wired)
            return;

        const { internet } = Network.wired;
        if (['connecting', 'connected'].includes(internet))
            stack.shown = internet;
        else if (Network.connectivity !== 'full')
            stack.shown = 'disconnected';
        else
            stack.shown = 'fallback';
    }),
});

const SimpleNetworkIndicator = () => Widget.Icon({
    setup: (self) => self.hook(Network, self => {
        const icon = Network[Network.primary || 'wifi']?.iconName;
        self.icon = icon || '';
        self.visible = icon;
    }),
});

const NetworkWifiIndicator = () => Widget.Stack({
    children: {
        'disabled': Widget.Label({ className: 'bar-indicator txt-norm slightly-right icon-material', label: 'wifi_off' }),
        'disconnected': Widget.Label({ className: 'bar-indicator txt-norm slightly-right icon-material', label: 'signal_wifi_off' }),
        'connecting': Widget.Label({ className: 'bar-indicator txt-norm slightly-right icon-material', label: 'settings_ethernet' }),
        '0': Widget.Label({ className: 'bar-indicator txt-norm slightly-right icon-material', label: 'signal_wifi_0_bar' }),
        '1': Widget.Label({ className: 'bar-indicator txt-norm slightly-right icon-material', label: 'network_wifi_1_bar' }),
        '2': Widget.Label({ className: 'bar-indicator txt-norm slightly-right icon-material', label: 'network_wifi_2_bar' }),
        '3': Widget.Label({ className: 'bar-indicator txt-norm slightly-right icon-material', label: 'network_wifi_3_bar' }),
        '4': Widget.Label({ className: 'bar-indicator txt-norm slightly-right icon-material', label: 'signal_wifi_4_bar' }),
    },
    setup: (self) => self.hook(Network, (stack) => {
        if (!Network.wifi) {
            return;
        }
        if (Network.wifi.internet == 'connected') {
            stack.shown = String(Math.ceil(Network.wifi.strength / 25));
        }
        else if (["disconnected", "connecting"].includes(Network.wifi.internet)) {
            stack.shown = Network.wifi.internet;
        }
    }),
});

export const NetworkIndicator = () => Widget.Stack({
    children: {
        'fallback': SimpleNetworkIndicator(),
        'wifi': NetworkWifiIndicator(),
        'wired': NetworkWiredIndicator(),
    },
    setup: (self) => self.hook(Network, stack => {
        if (!Network.primary) {
            stack.shown = 'wifi';
            return;
        }
        const primary = Network.primary || 'fallback';
        if (['wifi', 'wired'].includes(primary))
            stack.shown = primary;
        else
            stack.shown = 'fallback';
    }),
});

const BarVolumeProgress = () => {
    const _updateProgress = (circprog) => { // Set circular progress value
        circprog.css = `font-size: ${Audio.speaker.isMuted ? 0 : Math.ceil(Math.abs(Audio.speaker.volume * 100))}px;`
    }
    return AnimatedCircProg({
        className: 'bar-indicator-circprog',
        vpack: 'center', hpack: 'center',
        extraSetup: (self) => self
            .hook(Audio, _updateProgress)
        ,
    })
}

const BarVolume = () => Widget.Box({
    className: 'spacing-h-4',
    children: [
        Widget.Overlay({
            child: Widget.Box({
                vpack: 'center',
                hpack: 'center',
                className: 'bar-volume',
                homogeneous: true,
                children: [
                    Widget.Label({
                        className: 'icon-material txt-small',
                        label: 'volume_up',
                        setup: (self) => self.hook(Audio, label => {
                            self.label = Audio.speaker.isMuted ? 'volume_off' : 'volume_up'
                        })
                    })
                ],
            }),
            overlays: [
                BarVolumeProgress(),
            ]
        }),
    ]
})

const Mpris = {

}

const getPlayer = (mpris) => {
    const players = mpris.players.filter(p => {
        return p.name.includes('spotify') || p.name.includes('mpv') || p.name.includes('firefox')
    })
    if (players.length == 0) {
        return null
    }
    const playing = players.find(p => p.playBackStatus == 'Playing')
    if (playing != null) {
        return playing
    }
    return players[0]
}

const BarBatteryProgress = () => {
    const _updateProgress = (circprog) => { // Set circular progress value
        // We have the ternary operator here because sometimes charged means < 100%
        // This just makes it look nice if plugged in
        circprog.css = `font-size: ${battery.charged ? 100 : Math.abs(battery.percent)}px;`

        circprog.toggleClassName('bar-indicator-circprog-low', battery.percent <= 30);
        circprog.toggleClassName('bar-indicator-circprog-full', battery.charged);
    }
    return AnimatedCircProg({
        className: 'bar-indicator-circprog',
        vpack: 'center', hpack: 'center',
        extraSetup: (self) => self
            .hook(battery, _updateProgress)
        ,
    })
}

const BarBattery = () => Widget.Box({
    className: 'spacing-h-4',
    tooltipText: "hi",
    children: [
        Widget.Overlay({
            child: Widget.Box({
                vpack: 'center',
                hpack: 'center',
                className: 'bar-batt',
                homogeneous: true,
                children: [
                    Widget.Label({
                        className: 'icon-material txt-small',
                        label: 'battery_full',
                        setup: (self) => self.hook(battery, label => {
                            if (battery.charged) {
                                self.label = 'bolt'
                            } else if (battery.percent >= 90) {
                                self.label = battery.charging ? 'battery_charging_90' : 'battery_6_bar'
                            } else if (battery.percent >= 80) {
                                self.label = battery.charging ? 'battery_charging_80' : 'battery_5_bar'
                            } else if (battery.percent >= 50) {
                                self.label = battery.charging ? 'battery_charging_50' : 'battery_4_bar'
                            } else if (battery.percent >= 40) {
                                self.label = battery.charging ? 'battery_charging_40' : 'battery_3_bar'
                            } else if (battery.percent >= 30) {
                                self.label = battery.charging ? 'battery_charging_30' : 'battery_2_bar'
                            } else if (battery.percent >= 20) {
                                self.label = battery.charging ? 'battery_charging_20' : 'battery_1_bar'
                            } else {
                                self.label = 'battery_1_bar'
                            }
                        })
                    })
                ],
                setup: (self) => self.hook(battery, box => {
                    box.toggleClassName('bar-batt-low', battery.percent <= 30);
                    box.toggleClassName('bar-batt-full', battery.charged);
                }),
            }),
            overlays: [
                BarBatteryProgress(),
            ]
        }),
    ]
})

const CPUUsage = () => BarResource('CPU Usage', 'stacks', `LANG=C top -bn1 | grep Cpu | sed 's/\\,/\\./g' | awk '{print $2}'`)

export const StatusIcons = (props = {}) => Widget.Box({
    ...props,
    child: Widget.Box({
        className: 'spacing-v-10',
        vertical: true,
        hpack: 'center',
        children: [
            MicMuteIndicator(),
            // NotificationIndicator(),
            NetworkIndicator(),
            Widget.Box({
                hpack: 'center',
                className: 'spacing-v-10',
                vertical: true,
                children: [BluetoothIndicator(), BluetoothDevices()]
            }),
            Widget.Box({}), // Add just a bit of space
            // In another file. This is blocking, and 
            // spotifyd is noob and will do network requests
            // so for now, none of that
            // BarMpris(),
            
            BarVolume(),
            CPUUsage(),
            BarBattery(),
            Widget.Box({}), // Add just a bit of space
        ]
    })
});
