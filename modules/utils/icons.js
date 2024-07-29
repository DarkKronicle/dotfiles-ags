const { Gtk } = imports.gi;

export function iconExists(iconName) {
    let iconTheme = Gtk.IconTheme.get_default();
    return iconTheme.has_icon(iconName);
}

export function substitute(str) {

    const regexSubstitutions = [
        {
            regex: /^steam_app_(\d+)$/,
            replace: "steam_icon_$1",
        }
    ]

    // Regex substitutions
    for (let i = 0; i < regexSubstitutions.length; i++) {
        const substitution = regexSubstitutions[i];
        const replacedName = str.replace(
            substitution.regex,
            substitution.replace,
        );
        if (replacedName != str) return replacedName;
    }

    // Guess: convert to kebab case
    if (!iconExists(str)) str = str.toLowerCase().replace(/\s+/g, "-");

    // Original string
    return str;
}
