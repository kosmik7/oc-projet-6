let modal = null
isLoggedIn()


//
// copié de portfolio.js temporairement
async function fetchProjets() {
    try {
        const response = await fetch("http://localhost:5678/api/works");

        // si code = 200
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }

    catch (error) {
        console.error(`Impossible d'obtenir les projets: ${error}`);
    }
};


function isLoggedIn() {
    const isLoggedIn = localStorage.getItem("token") != null;
    console.log(isLoggedIn);

    if (isLoggedIn == true) {
        adminInterface()
        listenModal()
    }
};

function adminInterface() {
    const elements = Array.from(document.getElementsByClassName("admin-ui")); // array.from pour la boucle foreach
    elements.forEach(element => element.classList.remove("hidden"));
};

function listenModal() {
    document.querySelectorAll(".js-modal").forEach(a => {
        a.addEventListener("click", (e) => {
            openModal(e)
            appendContentModal(e.target.closest("a").dataset.modal)
        })
    })
};

function openModal(e) {
    e.preventDefault()
    modal = document.querySelector(e.target.closest("a").getAttribute("href"))
    modal.style.display = null
    modal.removeAttribute("aria-hidden")
    modal.setAttribute("aria-modal", "true")
    modal.querySelector(".js-modal-btn--close").addEventListener("click", closeModal)
    window.addEventListener("click", (e) => {
        if (e.target == modal) closeModal(e)
    })
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.key === "esc") closeModal(e)
    })
};

function closeModal(e) {
    e.preventDefault()
    if (modal == null) return
    modal.style.display = "none"
    modal.setAttribute("aria-hidden", "true")
    modal.removeAttribute("aria-modal")
    modal.querySelector(".js-modal-btn--close").removeEventListener("click", closeModal)
    window.removeEventListener("click", (e) => {
        if (e.target == modal) closeModal(e)
    })
    window.removeEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.key === "esc") closeModal(e)
    })
    modal = null
};

async function appendContentModal(target) {
    const fragment = document.createDocumentFragment();
    const modalElement = document.getElementById("modal__form");

    // Construction
    const modalContent = document.createElement("form");
    modalContent.setAttribute("id", modalElement.getAttribute("id"));
    fragment.appendChild(modalContent)

    console.log(target)
    switch (target) {
        case "portfolio":
            modalContent.appendChild(await contentModalPortfolioA())
            break;
    }

    // insert Node
    modalElement.replaceWith(fragment)
};


// différents contenus possibles de la fenetre modale
const contentModalPortfolioA = async () => {
    const fragment = document.createDocumentFragment();
    const projets = await fetchProjets();

    const h3 = document.createElement("h3");
    h3.textContent = "Galerie Photo";
    fragment.appendChild(h3)

    const gallery = document.createElement("div");
    gallery.setAttribute("class", "modal-content modal-gallery");
    fragment.appendChild(gallery)

    for (let element of projets) {
        const figure = document.createElement("figure");
        gallery.appendChild(figure)

        const img = document.createElement("img")
        img.setAttribute("crossorigin", "anonymous"); // permet de passer outre l'erreur 'cross-origin-resource-policy: same-origin'
        img.setAttribute("src", element.imageUrl);
        img.setAttribute("alt", element.title);
        figure.appendChild(img)

        const buttonsContainer = document.createElement("div")
        buttonsContainer.setAttribute("class", "btn-container")
        figure.appendChild(buttonsContainer)

        const buttonMove = document.createElement("button")
        buttonMove.setAttribute("class", "btn-move")
        const iconMove = document.createElement("i")
        iconMove.setAttribute("class", "fa-solid fa-arrows-up-down-left-right")
        buttonsContainer.appendChild(buttonMove)
        buttonMove.appendChild(iconMove)

        const buttonTrash = document.createElement("button")
        const iconTrash = document.createElement("i")
        iconTrash.setAttribute("class", "fa-solid fa-trash-can")
        buttonsContainer.appendChild(buttonTrash)
        buttonTrash.appendChild(iconTrash)

        const figcaption = document.createElement("figcaption");
        figcaption.textContent = "éditer";
        figure.appendChild(figcaption)
    }

    const separator = document.createElement("hr");
    fragment.appendChild(separator)

    const submitBtn = document.createElement("input");
    submitBtn.setAttribute("class", "btn");
    submitBtn.setAttribute("type", "submit");
    submitBtn.setAttribute("value", "Ajouter une photo");
    fragment.appendChild(submitBtn)

    const deleteAll = document.createElement("a");
    deleteAll.setAttribute("href", "#");
    deleteAll.textContent = "Supprimer la galerie";
    deleteAll.style.color = "red";
    fragment.appendChild(deleteAll)

    return fragment
}
























/*
async function contentModal(type) {
    const modalId = "modal__form"
    const modalElement = modal.getElementById(modalId);
    const modalContent = document.createElement("form");
    modalContent.setAttribute("class", modalId);

    // fragment
    let fragment = document.createDocumentFragment();
    fragment.appendChild(modalContent)

    // éléments
    let heading = document.createElement("h3");
    heading.textContent = "Galerie photo";
    modalContent.appendChild(heading)

    let content = document.createElement("div");
    content.setAttribute("class", "modal-content modal-gallery");
    modalContent.appendChild(content)

    const projets = await fetchProjets();
    for (let element of projets) {
        let figure = document.createElement("figure");

        let img = document.createElement("img")
        img.setAttribute("crossorigin", "anonymous"); // permet de passer outre l'erreur 'cross-origin-resource-policy: same-origin'
        img.setAttribute("src", element.imageUrl);
        img.getAttribute("alt", element.title);

        let figcaption = document.createElement("figcaption");
        figcaption.textContent = "éditer";

        // ajout au container
        figure.appendChild(img)
        figure.appendChild(figcaption)
        content.appendChild(figure)
    }

    let separator = document.createElement("hr");
    modalContent.appendChild(separator)

    let submitBtn = document.createElement("input");
    submitBtn.setAttribute("class", "btn");
    submitBtn.setAttribute("type", "submit");
    submitBtn.setAttribute("value", "Ajouter une photo");
    modalContent.appendChild(submitBtn)



    // ajoute le fragment au DOM
    modalElement.replaceWith(fragment)
}
*/


// mettre les templates dans une constante avec const = function
// pour les appeler ensuite facilement
// const modalTemplate1 = function ()







/*
function listenModal() {
    const modalButtons = Array.from(document.getElementsByClassName("btn-modal"));
    const modalWrapper = document.getElementById("modal-wrapper");
    const modalClose = document.querySelector(".modal-close-btn");
    let modalType

    // event listeners sur tout les boutons "btn-modal"
    modalButtons.forEach(element => {
        element.onclick = (selectedItem) => {
            selectedItem.preventDefault();
            modalWrapper.style.display = "block";

            modalType = element.dataset.modal
            contentModal(modalType)
            console.log(modalType)
        }
    });

    modalClose.onclick = () => {
        modalWrapper.style.display = "none";
    }

    window.onclick = (event) => {
        if (event.target == modalWrapper) {
            modalWrapper.style.display = "none";
        }
    }
};

async function contentModal(type) {
    const modalId = "modal__form"
    const modalElement = document.getElementById(modalId);
    const modalContent = document.createElement("form");
    modalContent.setAttribute("class", modalId);

    // fragment
    let fragment = document.createDocumentFragment();
    fragment.appendChild(modalContent)

    // éléments
    let heading = document.createElement("h3");
    heading.textContent = "Galerie photo";
    modalContent.appendChild(heading)

    let content = document.createElement("div");
    content.setAttribute("class", "modal-content modal-gallery");
    modalContent.appendChild(content)

    const projets = await fetchProjets();
    for (let element of projets) {
        let figure = document.createElement("figure");

        let img = document.createElement("img")
        img.setAttribute("crossorigin", "anonymous"); // permet de passer outre l'erreur 'cross-origin-resource-policy: same-origin'
        img.setAttribute("src", element.imageUrl);
        img.getAttribute("alt", element.title);

        let figcaption = document.createElement("figcaption");
        figcaption.textContent = "éditer";

        // ajout au container
        figure.appendChild(img)
        figure.appendChild(figcaption)
        content.appendChild(figure)
    }

    let separator = document.createElement("hr");
    modalContent.appendChild(separator)

    let submitBtn = document.createElement("input");
    submitBtn.setAttribute("class", "btn");
    submitBtn.setAttribute("type", "submit");
    submitBtn.setAttribute("value", "Ajouter une photo");
    modalContent.appendChild(submitBtn)



    // ajoute le fragment au DOM
    modalElement.replaceWith(fragment)
}
*/