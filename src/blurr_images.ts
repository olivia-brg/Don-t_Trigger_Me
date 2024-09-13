
function createOrGetStylesheet(): CSSStyleSheet {
    const existingStylesheet = document.querySelector<HTMLStyleElement>(
        "style#dynamic-stylesheet"
    );
    if (existingStylesheet) {
        return existingStylesheet.sheet as CSSStyleSheet;
    }
    const stylesheet = document.createElement("style");
    stylesheet.id = "dynamic-stylesheet";
    document.head.appendChild(stylesheet);
    return stylesheet.sheet as CSSStyleSheet;
}

function insertBlurRule(): void {
    const sheet = createOrGetStylesheet();
    if (sheet) {
        try {
            sheet.insertRule(
                ".blurred { filter: blur(50px); }",
                sheet.cssRules.length
            );
        } catch (e) {
            console.error("Error inserting blur rule:", e);
        }
    }
}

export function blurrImages(): void {
    insertBlurRule();
    const images = document.querySelectorAll<HTMLImageElement>("img");
    images.forEach((img) => {
        img.classList.add("blurred");
    });
}
