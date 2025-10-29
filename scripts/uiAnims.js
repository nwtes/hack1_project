// Minimal UI helpers: only toggle border color for correct/wrong
// This intentionally removes transient animations and class-based effects.
window.uiAnim = window.uiAnim || (function () {
    function setLayerColor(layer, color) {
        try {
            if (!layer) return;
            // Prefer Leaflet API if available
            if (typeof layer.setStyle === 'function') {
                layer.setStyle({ color: color, weight: 1, fillOpacity: 0.2 });
                return;
            }
            // Fallback to DOM/SVG element manipulation
            const el = (layer.getElement && layer.getElement()) || layer._path || null;
            if (el && el.style) {
                el.style.stroke = color;
                // small fallback for fill
                try { el.style.fill = color; } catch (e) {}
            }
        } catch (err) {
            console.warn('setLayerColor error', err);
        }
    }

    function markCountryCorrect(layer) {
        setLayerColor(layer, '#1db954'); // green
    }

    function markCountryWrong(layer) {
        setLayerColor(layer, '#ff4d4f'); // red
    }

    return {
        markCountryCorrect,
        markCountryWrong
    };
}());