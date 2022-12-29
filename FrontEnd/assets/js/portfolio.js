// faites l’appel à l’API avec fetch afin de récupérer dynamiquement les projets. 
async function fetchProjets() {
  const url = 'http://localhost:5678/api/works'

  try {
    const response = await fetch(url);

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
}

// utilisez JavaScript pour ajouter à la galerie les projets que vous avez récupéré.
// aide: https://www.javascripttutorial.net/javascript-dom/javascript-innerhtml-vs-createelement/
async function createGallery() {
  const projets = await fetchProjets();
  const galleryContainer = document.querySelector('#portfolio div.gallery');

  // composer les noeuds DOM
  let fragment = document.createDocumentFragment();
  for (let element of projets) {
    // html
    let figure = document.createElement('figure');
    let img = document.createElement('img')
    img.setAttribute('crossorigin', 'anonymous');   // permet de passer outre l'erreur lié à 'cross-origin-resource-policy: same-origin'
    img.setAttribute('src', element.imageUrl);
    img.getAttribute('alt', element.title);
    let figcaption = document.createElement('figcaption');
    figcaption.textContent = element.title;

    // ajout au fragment
    figure.appendChild(img)
    figure.appendChild(figcaption)
    fragment.appendChild(figure)
  }

  // ajout du fragment au DOM
  galleryContainer.appendChild(fragment);
}

createGallery();