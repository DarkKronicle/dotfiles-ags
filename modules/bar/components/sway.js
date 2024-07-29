const { GLib, Gdk, Gtk } = imports.gi;
const Lang = imports.lang;
const Cairo = imports.cairo;
const Pango = imports.gi.Pango;
const PangoCairo = imports.gi.PangoCairo;
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Sway from "../../../services/sway.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
const { execAsync, exec } = Utils;
const { Box, DrawingArea, EventBox } = Widget;

const dummyWs = Box({ className: 'bar-ws' }); // Not shown. Only for getting size props
const dummyActiveWs = Box({ className: 'bar-ws bar-ws-active' }); // Not shown. Only for getting size props
const dummyOccupiedWs = Box({ className: 'bar-ws bar-ws-occupied' }); // Not shown. Only for getting size props

const switchToWorkspace = (arg) => Utils.execAsync(`swaymsg workspace ${arg}`).catch(print);

const WorkspaceContents = () => {
    return DrawingArea({
        css: `transition: 90ms cubic-bezier(0.1, 1, 0, 1);`,
        widthRequest: 25,
        heightRequest: 50,
        attribute: {
            activeIndex: 0,
            workspaces: [],
            initialized: false
        },
        setup: (area) => area
            .hook(Sway, (self) => {
                // Hook first so that workspaces are actually set
                self.attribute.workspaces = Sway.workspaces.filter(ws => !ws.name.startsWith("__")).map(ws => ws.name).sort()
                const { width, height } = self.get_allocation()
                self.queue_draw_area(0, 0, width, height)
            }, 'notify::workspaces')
            .hook(Sway.active.workspace, (self) => {
                self.attribute.activeIndex = self.attribute.workspaces.indexOf(Sway.active.workspace.name)
            })
            .on('draw', Lang.bind(area, (area, cr) => {
                const self = area
                const allocation = area.get_allocation();
                const { width, height } = allocation;

                const workspaceStyleContext = dummyWs.get_style_context();
                const workspaceDiameter = workspaceStyleContext.get_property('min-width', Gtk.StateFlags.NORMAL);
                const workspaceRadius = workspaceDiameter / 2;
                const workspaceFontSize = workspaceStyleContext.get_property('font-size', Gtk.StateFlags.NORMAL) / 4 * 3;
                const workspaceFontFamily = workspaceStyleContext.get_property('font-family', Gtk.StateFlags.NORMAL);
                const wsbg = workspaceStyleContext.get_property('background-color', Gtk.StateFlags.NORMAL);
                const wsfg = workspaceStyleContext.get_property('color', Gtk.StateFlags.NORMAL);

                const occupiedWorkspaceStyleContext = dummyOccupiedWs.get_style_context();
                const occupiedbg = occupiedWorkspaceStyleContext.get_property('background-color', Gtk.StateFlags.NORMAL);
                const occupiedfg = occupiedWorkspaceStyleContext.get_property('color', Gtk.StateFlags.NORMAL);

                const activeWorkspaceStyleContext = dummyActiveWs.get_style_context();
                const activebg = activeWorkspaceStyleContext.get_property('background-color', Gtk.StateFlags.NORMAL);
                const activefg = activeWorkspaceStyleContext.get_property('color', Gtk.StateFlags.NORMAL);
                area.set_size_request(28, workspaceDiameter * (self.attribute.workspaces.length));
                const widgetStyleContext = area.get_style_context();
                const activeWs = self.attribute.activeIndex + 1;

                const activeWsCenterX = workspaceDiameter / 2;
                const activeWsCenterY = -(workspaceDiameter / 2) + (workspaceDiameter * activeWs);

                // Font
                const layout = PangoCairo.create_layout(cr);
                const fontDesc = Pango.font_description_from_string(`${workspaceFontFamily[0]} SemiBold ${workspaceFontSize}`);
                layout.set_font_description(fontDesc);
                cr.setAntialias(Cairo.Antialias.BEST);
                // Get kinda min radius for number indicators
                layout.set_text("00", -1);
                const [layoutWidth, layoutHeight] = layout.get_pixel_size();
                const indicatorRadius = Math.max(layoutWidth, layoutHeight) / 2 * 1.2; // a bit smaller than sqrt(2)*radius
                const indicatorGap = workspaceRadius - indicatorRadius;

                // Draw workspace numbers
                for (let i = 0; i < self.attribute.workspaces.length; i++) {
                    if (i == self.attribute.activeIndex) {
                        cr.setSourceRGBA(activebg.red, activebg.green, activebg.blue, activebg.alpha);
                    } else {
                        cr.setSourceRGBA(wsfg.red, wsfg.green, wsfg.blue, wsfg.alpha);
                    };
                    layout.set_text(self.attribute.workspaces[i], -1);
                    const [layoutWidth, layoutHeight] = layout.get_pixel_size();
                    const x = (width - layoutWidth) / 2;
                    const y = -workspaceRadius + (workspaceDiameter * (i + 1)) - (layoutHeight / 2);
                    cr.moveTo(x, y);
                    // cr.showText(text);
                    PangoCairo.show_layout(cr, layout);
                    cr.stroke();
                }

                // Draw active ws
                // base
                // cr.setSourceRGBA(activebg.red, activebg.green, activebg.blue, activebg.alpha);
                // cr.arc(activeWsCenterX, activeWsCenterY, indicatorRadius, 0, 2 * Math.PI);
                // cr.fill();
                // inner decor
                // cr.setSourceRGBA(activefg.red, activefg.green, activefg.blue, activefg.alpha);
                // cr.arc(activeWsCenterX, activeWsCenterY, indicatorRadius * 0.2, 0, 2 * Math.PI);
                // cr.fill();
            }))
        ,
    })
}

export default () => EventBox({
    onMiddleClick: () => toggleWindowOnAllMonitors('osk'),
    onSecondaryClick: () => App.toggleWindow('overview'),
    attribute: { clicked: false },
    child: Box({
        homogeneous: true,
        className: 'bar-group-margin',
        children: [Box({
            className: 'bar-group bar-group-standalone bar-group-pad',
            css: 'min-width: 2px;',
            children: [
                WorkspaceContents(),
            ]
        })]
    }),
    setup: (self) => {
        self.add_events(Gdk.EventMask.POINTER_MOTION_MASK);
        self.on('motion-notify-event', (self, event) => {
            // if (!self.attribute.clicked) return;
        })
        self.on('button-press-event', (self, event) => {
            if (!(event.get_button()[1] === 1)) return; // We're only interested in left-click here
            self.attribute.clicked = true;
            // const [_, cursorX, cursorY] = event.get_coords();
            // const widgetHeight = self.get_allocation().height;
            // const wsId = Math.ceil(cursorY * userOptions.workspaces.shown / widgetWidth);
            // switchToWorkspace(wsId);
        })
        self.on('button-release-event', (self) => self.attribute.clicked = false);
    }
});
