let modal = null

const token = localStorage.getItem("token")
if (token != null) adminInterface()

function adminInterface() {
    const elements = Array.from(document.getElementsByClassName("admin-ui")); // array.from pour la boucle foreach
    elements.forEach(element => element.classList.remove("hidden"));
    listenModal()
};

function listenModal() {
    document.querySelectorAll(".js-modal").forEach(a => {
        a.addEventListener("click", (e) => {
            createModal(e.target.closest("a").dataset.modal)
            openModal(e)
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

async function createModal(target) {
    const fragment = document.createDocumentFragment();
    const modalElement = document.getElementById("modal__form");

    // Construction
    const modalContent = document.createElement("div");
    modalContent.setAttribute("id", modalElement.getAttribute("id"));
    fragment.appendChild(modalContent)

    console.log(target)
    switch (target) {
        case "portfolio":
            modalContent.appendChild(await contentPortfolioA())
            break;
    }

    // insert Node
    modalElement.replaceWith(fragment)
};

async function deleteWorks(id) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`
            }
        })
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        console.log(`Le projet /works/{id}=${id} a été supprimé de la base de donnée avec succès`)
        document.querySelectorAll(`[data-id="${id}"]`).forEach(element => element.remove())
    }
    catch (error) {
        console.error(`Impossible de supprimer le projet /works/{id}=${id}: ${error}`);
    }
};

// différents contenus possibles de la fenetre modale
const contentPortfolioA = async () => {
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
        figure.setAttribute("data-id", element.id);
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
        buttonMove.setAttribute("type", "submit");

        const iconMove = document.createElement("i")
        iconMove.setAttribute("class", "fa-solid fa-arrows-up-down-left-right")
        buttonsContainer.appendChild(buttonMove)
        buttonMove.appendChild(iconMove)

        const buttonTrash = document.createElement("button");
        buttonTrash.setAttribute("class", "btn-delete")
        buttonTrash.setAttribute("type", "submit");
        buttonTrash.addEventListener("click", (e) => {
            const id = e.target.closest('figure').dataset.id;
            deleteWorks(id);
        });

        const iconTrash = document.createElement("i");
        iconTrash.setAttribute("class", "fa-solid fa-trash-can")
        buttonsContainer.appendChild(buttonTrash)
        buttonTrash.appendChild(iconTrash)

        const figcaption = document.createElement("figcaption");
        figcaption.textContent = "éditer"
        figure.appendChild(figcaption)
    }

    const separator = document.createElement("hr");
    fragment.appendChild(separator)

    const submitBtn = document.createElement("input");
    submitBtn.setAttribute("class", "btn-submit");
    submitBtn.setAttribute("type", "button");
    submitBtn.setAttribute("value", "Ajouter une photo");
    fragment.appendChild(submitBtn)

    const deleteAll = document.createElement("a");
    deleteAll.setAttribute("href", "#");
    deleteAll.textContent = "Supprimer la galerie";
    deleteAll.style.color = "red";
    fragment.appendChild(deleteAll)

    return fragment
}