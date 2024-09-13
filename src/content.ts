import { blurrImages } from "./blurr_images";

export function blockWords() {
    let hasBlockedWords = false;
    let blockedWordCount = 0; // Counter for blocked words

    // Check if we are in the popup
    if (document.getElementById("wordList")) {
        return; // Skip processing if it's the popup
    }

    chrome.storage.sync.get(["blockedWords", "blurButtonToggled"], (result) => {
        const blockedWords: string[] = result.blockedWords || [];
        const isBlurToggled: boolean = result.blurButtonToggled || false;

        function traverse(node: Node) {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = (node as Text).textContent || "";
                blockedWords.forEach((word) => {
                    const accentMap: { [key: string]: string } = {
                        a: "[aàáâäãåAÀÁÂÄÃÅ]",
                        e: "[eéèêëEÉÈÊË]",
                        i: "[iíîïIÍÎÏ]",
                        o: "[oòóôöõOÒÓÔÖÕ]",
                        u: "[uùúûüUÙÚÛÜ]",
                    };

                    // Normalize both accented and unaccented characters
                    const normalizeWord = (word: string) => {
                        return word.replace(
                            /[aeiouáàâäãåéèêëíîïóòôöõúûü]/gi,
                            (match) => {
                                const lowerMatch = match.toLowerCase();
                                return accentMap[lowerMatch] || match;
                            }
                        );
                    };

                    // Create the regex to match words with 0-2 extra characters
                    const regex = new RegExp(
                        `\\b${normalizeWord(word)}\\w{0,2}\\b`,
                        "gi"
                    );

                    const matches = text.match(regex);
                    if (matches) {
                        hasBlockedWords = true;
                        blockedWordCount += matches.length; // Count the number of matches found
                        text = text.replace(regex, (match) =>
                            "*".repeat(match.length)
                        );
                    }
                });
                (node as Text).textContent = text;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (!["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.nodeName)) {
                    node.childNodes.forEach(traverse);
                }
            }
        }

        // Traverse all nodes in the body
        traverse(document.body);

        // If blocked words were found, show an alert
        if (hasBlockedWords) {
            alert(`Cette page contient ${blockedWordCount} mot(s) bloqué(s) !`);
            // Call blurrImages if the blur button is toggled
            if (isBlurToggled) {
                blurrImages();
            }
        }
    });
}

// Ensure the function runs when the DOM is fully loaded
window.addEventListener("DOMContentLoaded", () => {
    blockWords();
});

// Observe for changes in the DOM (for dynamic content)
const observer = new MutationObserver(() => {
    blockWords();
});

observer.observe(document.body, { childList: true, subtree: true });