import { Bar } from './modules/bar/main.js';
import NotificationPopups from './modules/notificationpopups.js';
import Pane from './modules/pane/main.js';
import { COMPILED_STYLE_DIR } from './init.js';

handleStyles()

globalThis['closeEverything'] = () => {
    App.closeWindow('paneleft');
};

App.config({
    windows: [
        Bar(1),
        NotificationPopups(1),
        Pane(),
    ],
    css: `${COMPILED_STYLE_DIR}/style.css`,
})
