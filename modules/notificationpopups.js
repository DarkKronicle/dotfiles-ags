// This file is for popup notifications
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';
const { Box } = Widget;
import Notification from './common/notification.js';
import Indicator from '../services/indicator.js';

const notifs = () => {
    return Box({
        vertical: true,
        hpack: 'center',
        className: 'osd-notifs spacing-v-5-revealer',
        css: 'padding: 1px;',
        attribute: {
            'map': new Map(),
            'dismiss': (box, id, force = false) => {
                if (!id || !box.attribute.map.has(id))
                    return;
                const notifWidget = box.attribute.map.get(id);
                if (notifWidget == null && !force)
                    return; // cuz already destroyed

                notifWidget.revealChild = false;
                notifWidget.attribute.destroyWithAnims();
                box.attribute.map.delete(id);
            },
            'notify': (box, id) => {
                if (!id || Notifications.dnd) return;
                if (!Notifications.getNotification(id)) return;

                const old = box.attribute.map.get(id);
                if (old != null) {
                    // TODO: I should maybe update the notification
                    // but the log is still fine, so /shrug
                    return
                }

                box.attribute.map.delete(id);

                const notif = Notifications.getNotification(id);
                const newNotif = Notification({
                    notifObject: notif,
                    isPopup: true,
                });
                box.attribute.map.set(id, newNotif);
                box.pack_end(box.attribute.map.get(id), false, false, 1);
                box.show_all();
            },
        },
        setup: (self) => self
            .hook(Notifications, (box, id) => box.attribute.notify(box, id), 'notified')
            .hook(Notifications, (box, id) => box.attribute.dismiss(box, id), 'dismissed')
            .hook(Notifications, (box, id) => box.attribute.dismiss(box, id, true), 'closed')
        ,
    });
}

export default (monitor = 0) => {
    return Widget.Window({
        name: `notifs${monitor}`,
        monitor,
        layer: 'overlay',
        visible: true,
        anchor: [ 'top', 'left' ],
        child: notifs(),
    })
}
