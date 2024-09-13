import { addWordList } from "./getListTrigger";
import { removeWordList } from "./getListTrigger";
import { getSubcategories } from "./getListTrigger";

export function fetchJSONData(): Promise<any> {

    return fetch(chrome.runtime.getURL("./assets/trigger_db.json"))
        .then((response) => response.json())
        .then((data) => {
            return data.categories;
        })
        .catch((error) => {
            console.error("Erreur lors du chargement du JSON:", error);
            throw error;
        });
}

export function displayTriggerCategorie(data: object) {
    if (document.getElementById("trigger_list")!.innerHTML === ``) {
        const categorieParagraph = document.createElement("p");

        for (const [index, [key]] of Object.entries(Object.entries(data))) {
            categorieParagraph.innerHTML += `
                <div>
                    <input type="checkbox" id="${key}" name="categorie"/>
                    <label for="categorie">
                        <button class="subCategorie" id="${key}">${key}</button>
                    </label>
                    <span id="sub-${key}"></span>
                </div>
                </br>`;
        }
        categorieParagraph.innerHTML += `<button id="validateOptionButton">Valider la sélection</button>`;

        document
            .getElementById("trigger_list")!
            .appendChild(categorieParagraph);
    } else {
        document.getElementById("trigger_list")!.innerHTML = ``;
    }
}

const buttonGroupPressed = (e: any) => {
    const isButton = e.target.nodeName === "BUTTON";

    if (!isButton) { return; }

    let getName: string;
    getName = e.target.id;

    if (getName === "validateOptionButton") {
        var checkboxList = document.querySelectorAll('input[type=checkbox]:checked');
        let formattedCheckboxList = Array.from(checkboxList).map(checkbox => checkbox.id);
        formattedCheckboxList.pop();        
        
        fetchJSONData()
        .then((jsonData) => {
                let subcategories = getSubcategories(jsonData, formattedCheckboxList);
                addWordList(subcategories)
                console.log(subcategories);
            })
            .catch((error) => {
                console.error("Erreur lors du chargement du JSON:", error);
            });
        return;
    }

    fetchJSONData()
        .then((jsonData) => {
            afficherSousCategorie(jsonData, getName);
        })
        .catch((error) => {
            console.error("Erreur lors du chargement du JSON:", error);
        });
};

const buttonGroup = document.getElementById("trigger_list");
buttonGroup!.addEventListener("click", buttonGroupPressed);

function afficherSousCategorie(jsonData: any, categorieCible: string) {
    if (jsonData.hasOwnProperty(categorieCible)) {
        const sousCategories = jsonData[categorieCible];

        if (
            !document.getElementById(`sub-${categorieCible}`)!.hasChildNodes()
        ) {
            const sousCategorieParagraph = document.createElement("p");

            for (const [index, [key]] of Object.entries(
                Object.entries(sousCategories)
            )) {
                sousCategorieParagraph.innerHTML += `
                        <div>
                            <input type="checkbox" id="${key}" name="categorie"/>
                            <label for="categorie">${key}</label>
                        </div>
                        </br>`;
            }
            document
                .getElementById(`sub-${categorieCible}`)!
                .appendChild(sousCategorieParagraph);
        } else {
            document.getElementById(`sub-${categorieCible}`)!.innerHTML = ``;
        }
    } else {
        console.error(`Catégorie "${categorieCible}" non trouvée.`);
    }
}

