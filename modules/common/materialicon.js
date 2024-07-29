import Widget from 'resource:///com/github/Aylur/ags/widget.js';

export const MaterialIcon = (icon, size, props = {}) => Widget.Label({
    hpack: 'center',
    className: `icon-material txt-${size}`,
    label: icon,
    ...props,
})
