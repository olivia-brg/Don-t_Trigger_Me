import { fetchJSONData } from "./getTriggerWordData";
import { displayTriggerCategorie } from "./getTriggerWordData";
import { blockWords } from "./content";

window.addEventListener("DOMContentLoaded", (event) => {
    const wordInput = document.getElementById("wordInput") as HTMLInputElement;
    const addWordButton = document.getElementById(
        "addWordButton"
    ) as HTMLButtonElement;
    // Event listener for the "Save Blocked Words" button
    const saveBlockedWordsButton = document.getElementById(
        "saveBlockedWords"
    ) as HTMLButtonElement;
    if (saveBlockedWordsButton) {
        saveBlockedWordsButton.addEventListener("click", () => {
            const blockedWordsInput = document.getElementById(
                "blockedWords"
            ) as HTMLTextAreaElement;
            const blockedWords = blockedWordsInput.value
                .split(",")
                .map((word) => word.trim())
                .filter((word) => word.length > 0);

            chrome.storage.sync.set({ blockedWords: blockedWords });
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0].id !== undefined) {
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tabs[0].id },
                            func: () => {
                                console.log("Executing blockWords function");
                                blockWords();
                            },
                        },
                        () => {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError.message);
                            }
                        }
                    );
                }
            });
        });
    }
});

// DOM elements
const saveBlockedWordsButton = document.getElementById(
    "saveBlockedWords"
) as HTMLButtonElement;
const blockedWordsInput = document.getElementById(
    "blockedWords"
) as HTMLTextAreaElement;
const wordListContainer = document.getElementById("wordList") as HTMLDivElement;
const wordItemTemplate = document.getElementById(
    "wordItemTemplate"
) as HTMLTemplateElement;

// Display saved words
export function displaySavedWords(): void {
    // Clear the current list
    wordListContainer.innerHTML = "";

    // Retrieve the saved words from storage
    chrome.storage.sync.get("blockedWords", (result) => {
        const savedWords: string[] = result.blockedWords || [];

        // Iterate through each word and create an element for it
        savedWords.forEach((word) => {
            // Clone the template content
            const templateContent = document.importNode(
                wordItemTemplate.content,
                true
            );

            // Since templateContent is a DocumentFragment, extract its first child
            const wordItem = templateContent.firstElementChild as HTMLElement;

            if (wordItem) {
                // Set the word text
                const wordTextElement = wordItem.querySelector(
                    ".word-text"
                ) as HTMLElement;
                if (wordTextElement) {
                    wordTextElement.textContent = word;
                }

                // Add click event listener to remove button
                const removeButton = wordItem.querySelector(
                    ".remove-word-button"
                ) as HTMLButtonElement;
                if (removeButton) {
                    removeButton.addEventListener("click", () => {
                        removeWord(word);
                    });
                }

                // Append the new word item to the container
                wordListContainer.appendChild(wordItem);
            }
        });
    });
}

// Add a new word
function addWord(newWords: string[]): void {
    chrome.storage.sync.get("blockedWords", (result) => {
        const existingBlockedWords = result.blockedWords || [];
        const updatedBlockedWords = [
            ...new Set([...existingBlockedWords, ...newWords]),
        ];

        chrome.storage.sync.set({ blockedWords: updatedBlockedWords }, () => {
            chrome.runtime.lastError
                ? console.error(
                      "Error saving blocked words:",
                      chrome.runtime.lastError
                  )
                : console.log(
                      "Blocked words saved to storage:",
                      updatedBlockedWords
                  );

            // Update the display
            displaySavedWords();

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

// Remove a word
function removeWord(wordToRemove: string): void {
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

            // Update the display
            displaySavedWords();

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

// Save button event listener
saveBlockedWordsButton.addEventListener("click", () => {
    if (blockedWordsInput) {
        const newBlockedWords = blockedWordsInput.value
            .split(",")
            .map((word) => word.trim())
            .filter((word) => word.length > 0);

        addWord(newBlockedWords);
        blockedWordsInput.value = "";
    }
});

// Display words when the popup opens
displaySavedWords();

document.addEventListener("DOMContentLoaded", () => {
    const showOption = document.getElementById(
        "showTriggerOption"
    ) as HTMLButtonElement;

    showOption.addEventListener("click", () => {
        fetchJSONData()
            .then((data) => {
                const header = document.getElementById("trigger_list");
                if (header) {
                    displayTriggerCategorie(data);
                }
            })
            .catch((error) => {
                console.error("Erreur lors du chargement du JSON:", error);
            });
        console.log("fetchjson data excecuted");
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const blurButton = document.getElementById(
        "blurButton"
    ) as HTMLInputElement;

    if (!blurButton) {
        console.error("Blur button element not found");
        return;
    }

    // Set the initial state of the blur button based on storage
    chrome.storage.sync.get("blurButtonToggled", (result) => {
        blurButton.checked = result.blurButtonToggled || false;
    });

    // Add event listener for the blur button toggle
    blurButton.addEventListener("change", () => {
        const isToggled = blurButton.checked;
        chrome.storage.sync.set({ blurButtonToggled: isToggled });
    });
}); 