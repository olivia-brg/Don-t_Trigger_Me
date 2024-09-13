window.addEventListener("DOMContentLoaded", (event) => {
  
    // Event listener for the "Open Options" button
    const openOptionsButton = document.getElementById(
        "openOptions"
    ) as HTMLButtonElement;
    if (openOptionsButton) {
        openOptionsButton.addEventListener("click", () => {
            chrome.tabs.create({ url: "public/options.html" });
        });
    }
});

