import { blockWords } from "./content";

export function addWordList(newWords: string[], storageKey: string = "blockedWords"): void {
    // Remplace directement les mots stockés avec les nouveaux mots
    const updatedBlockedWords = [...new Set(newWords)];

    chrome.storage.sync.set({ [storageKey]: updatedBlockedWords }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error saving words:", chrome.runtime.lastError);
        } else {
            console.log(`Words saved to storage under key "${storageKey}":`, updatedBlockedWords);
        }

        // Optionnellement, bloquer les mots sur l'onglet actif actuel
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id !== undefined) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: blockWords,
                });
            } else {
                console.error("No active tab found!");
            }
        });
    });
}



export function removeWordList(wordToRemove: string): void {
    chrome.storage.sync.get("blockedWords", (result) => {
        const savedWords: string[] = result.blockedWords || [];
        const updatedWords = savedWords.filter((word) => word !== wordToRemove);

        chrome.storage.sync.set({ blockedWords: updatedWords }, () => {
            chrome.runtime.lastError
                ? console.error(
                    "Error saving blocked words:",
                    chrome.runtime.lastError
                )
                : console.log("Blocked words updated:", updatedWords);

            // Optionally, block words on the current active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0].id !== undefined) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: blockWords,
                    });
                } else {
                    console.error("No active tab found!");
                }
            });
        });
    });
}

type Categories = {
    [key: string]: {
        [subCategory: string]: string[];
    };
};

export function getSubcategories(categories: Categories, keys: string[] | string): string[] {
    let result: string[] = [];

    // Si `keys` est une string, on la convertit en un tableau de string
    const keysArray = typeof keys === "string" ? [keys] : keys;

    keysArray.forEach(key => {
        Object.keys(categories).forEach(mainCategory => {
            if (categories[mainCategory][key]) {
                result = result.concat(categories[mainCategory][key]);
            } else if (mainCategory === key) {
                Object.values(categories[mainCategory]).forEach(subArray => {
                    result = result.concat(subArray);
                });
            }
        });
    });

    console.log(result);
    return result;
}
