// JS global minimaliste
// Ajoutez ici des interactions globales si besoin

// Affichage du graph 3D sur la homepage
import { renderHomeGraph } from './components/graph_home.js';

// Affichage du graph 3D sur la homepage (plus de gestion image projet ici)
renderHomeGraph('graph3d');

const nav = document.querySelector('nav');
const main = document.querySelector('main');
if (main) {
  main.style.marginTop = '0';
  main.style.padding = '0';
  main.style.display = 'block';
}
if (nav) {
  nav.style.marginBottom = '0';
}
