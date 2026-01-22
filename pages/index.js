// pages/index.js
// Intègre le graph et le composant image de fond
import { renderHomeGraph } from '../components/graph_home.js';
import { setProjectBackground, clearProjectBackground } from '../components/img_project_graphhome.js';

document.addEventListener('DOMContentLoaded', () => {
  renderHomeGraph('3d-graph-container', {
    onProjectNodeClick: (projectId) => setProjectBackground(projectId),
    onNonProjectClick: () => clearProjectBackground()
  });
});
