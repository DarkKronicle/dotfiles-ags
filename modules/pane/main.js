import PopupWindow from '../common/popupwindow.js';
import PaneLeft from './paneleft.js';
// import { clickCloseRegion } from '../common/clickcloseregion.js';


export default () => PopupWindow({
    keymode: 'on-demand',
    anchor: [ 'left', 'top', 'bottom' ],
    name: 'paneleft',
    layer: 'overlay',
    child:
        // clickCloseRegion({ name: 'paneleft', multimonitor: false, fillMonitor: 'horizontal' }),
        PaneLeft(),
})
