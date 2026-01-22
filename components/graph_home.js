import { showProjectImageFrame, hideProjectImageFrame, removePinnedProjectFrame, isProjectPinned } from './img_project_graphhome.js';

export function renderHomeGraph(containerId, opts = {}) {
  fetch('../assets/types_graph.json')
    .then(r => r.json())
    .then(data => {
      if (data && data.nodes) {
        const bound = window.innerHeight / 24;
        data.nodes.forEach(node => {
          node.x = Math.random() * bound * 2 - bound;
          node.y = Math.random() * bound * 2 - bound;
          node.z = Math.random() * bound * 2 - bound;
        });
      }
      const fg = ForceGraph3D()(document.getElementById(containerId))
        .graphData(data)
        .backgroundColor('rgba(255,255,255,0)') // Fond transparent pour voir l'image de fond
        .nodeLabel('id')
        .nodeAutoColorBy('type')
        // .linkColor(() => '#111')
        .linkColor(link => link.type === 'invisible-link' ? '#111' : '#000')
        .linkWidth(link => link.type === 'invisible-link' ? 0.3 : 0.1)
        .linkOpacity(link => link.type === 'invisible-link' ? 1 : 0.5)
        .d3Force('boundary', function() {
            const bound = window.innerHeight / 12;
            return function(alpha) {
                fg.graphData().nodes.forEach(node => {
                node.x = Math.max(-bound, Math.min(bound, node.x));
                node.y = Math.max(-bound, Math.min(bound, node.y));
                node.z = Math.max(-bound, Math.min(bound, node.z));
                });
            };
        })
        
        .nodeThreeObject(node => {
          const nodeSize = node.size || (node.type === 'projet' ? 70 : 22);
          if (node.type === 'projet') {
            // Projet : cercle noir + label + sous-texte (date), taille dynamique
            const width = nodeSize * 14;
            const height = nodeSize * 3.2;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            // Cercle noir
            ctx.save();
            ctx.beginPath();
            ctx.arc(nodeSize + 20, height/2, nodeSize, 0, 2 * Math.PI);
            const phraseIdx = Number(window.currentPhraseIndex);
            const highlight = Array.isArray(node.highlight_phrases) && phraseIdx >= 1 && node.highlight_phrases.includes(phraseIdx);
            ctx.fillStyle = highlight ? '#d32f2f' : '#111'; // rouge si highlight, sinon noir
            ctx.globalAlpha = 1;
            ctx.fill();
            ctx.restore();
            // Texte principal (id)
            let fontSize = nodeSize * 1.5;
            ctx.font = `bold ${fontSize}px Menlo, monospace`;
            ctx.fillStyle = '#111';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.id, nodeSize * 2.8, height/2 - nodeSize * 0.4);
            // Sous-texte (date ou placeholder)
            ctx.font = `italic ${Math.round(nodeSize * 0.8)}px Menlo, monospace`;
            ctx.fillStyle = '#888';
            ctx.fillText(node.date || 'date...', nodeSize * 2.8, height/2 + nodeSize * 0.8);
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({map: texture});
            material.transparent = true;
            material.alphaTest = 0.05;
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(nodeSize * 0.65, nodeSize * 0.15, 1);
            sprite.center.set((nodeSize + 20)/width, 0.5);
            return sprite;
          } else if (node.type === 'theme') {
            // Theme : petit cercle noir, taille dynamique
            const size = nodeSize;
            const canvas = document.createElement('canvas');
            canvas.width = size * 2;
            canvas.height = size * 2;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.beginPath();
            ctx.arc(size, size, size, 0, 2 * Math.PI);
            ctx.fillStyle = '#111';
            ctx.globalAlpha = 1;
            ctx.fill();
            ctx.restore();
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({map: texture});
            material.transparent = true;
            material.alphaTest = 0.05;
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(size * 0.18, size * 0.18, 1);
            sprite.center.set(0.5, 0.5);
            return sprite;
          }
        })
        .nodeLabel(node => {
          if (node.type === 'theme') {
            return node.id;
          } else if (node.type === 'projet') {
            return '';
          }
        });

        window.addEventListener('phraseIndexChanged', () => {
        if (fg && typeof fg.refresh === 'function') fg.refresh();
        });

      // Affichage fenêtre image projet au hover (désactivé si déjà cliqué)
      fg.onNodeHover(async node => {
        if (node && node.type === 'projet' && !isProjectPinned(node.id)) {
          await showProjectImageFrame(node.id, ...getNodeScreenPos(node, fg), node.id, null, true);
        } else {
          hideProjectImageFrame();
        }
      });
      
      // Affichage fenêtre image projet au clic (ouvre une frame "pinned" qui ne se ferme que par la croix)
      fg.onNodeClick(async node => {
        if (node && node.type === 'projet') {
          await showProjectImageFrame(node.id, ...getNodeScreenPos(node, fg), node.id, null, false);
          // Ajoute à la liste des projets pinned (évite les doublons)
          if (!Array.isArray(window.pinnedProjects)) window.pinnedProjects = [];
          if (!window.pinnedProjects.includes(node.id)) {
            window.pinnedProjects.push(node.id);
          }
          // Ferme toutes les frames hover pour tous les projets
          document.querySelectorAll('.project-img-frame-hover').forEach(f => f.style.display = 'none');
        }
      });
      // Fermer la frame pinned uniquement via la croix (plus de fermeture auto sur clic extérieur)
      // (la croix appelle removePinnedProjectFrame dans showProjectImageFrame)

      // Utilitaire pour obtenir la position écran d'un node
      function getNodeScreenPos(node, fg) {
        const camera = fg.camera();
        const renderer = fg.renderer();
        const width = renderer.domElement.width;
        const height = renderer.domElement.height;
        const vector = new THREE.Vector3(node.x, node.y, node.z);
        vector.project(camera);
        const screenX = (vector.x + 1) / 2 * width;
        const screenY = (-vector.y + 1) / 2 * height;
        return [screenX, screenY];
      }

      // Camera auto-orbit (méthode officielle) - désactivable
      let angle = 0;
      // === MODIFIE ICI LA DISTANCE CAMERA ORBIT ===
      let graphCameraDistance = 500; // <--- change cette valeur pour rapprocher/éloigner la caméra
      let autoOrbit = true;
      const orbitInterval = setInterval(() => {
        if (autoOrbit) {
          angle += Math.PI / 2000;
          fg.cameraPosition({
            x: graphCameraDistance * Math.sin(angle),
            z: graphCameraDistance * Math.cos(angle),
            y: fg.camera().position.y
          });
        }
      }, 20);

    });
}
