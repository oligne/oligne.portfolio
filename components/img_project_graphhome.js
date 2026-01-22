window.pinnedProjects = []; ///liste suivi projet cliqué   

/// JSON data PORTFOILIO
fetch('./assets/types_graph.json')
  .then(r => r.json())
  .then(json => {
    window.projectsData = json.nodes.filter(n => n.type === 'projet');
  });


// Affiche une image ou vidéo "fenêtre" près du node projet (x, y = coordonnées écran)
export async function showProjectImageFrame(projectId, screenX, screenY, projectLabel = '', forceExt = null, isHover = false) {
  const frameId = `project-img-frame-${projectId}${isHover ? '-hover' : ''}`;
  let frame = document.getElementById(frameId);
  const frameMinWidth = 250;
  const frameMinHeight = 120;
  let frameWidth = 400;
  let frameHeight = 260;
  const titlebarHeight = 38;

  // --- Empêche la création de plusieurs frames hover/click pour le même projet ---
  if (frame) {
    frame.style.display = 'block';
    return;
  }

  // Empêche l'ouverture d'un hover si le projet est déjà pinned
  if (isHover && window.pinnedProjects.includes(projectId)) {
    return;
  }

  // Détection extension (mp4, mov ou png)
  let mediaExt = 'png';
  let found = false;
  if (!forceExt) {
    const mp4Url = `../assets/projet/${encodeURIComponent(projectId)}.mp4`;
    const movUrl = `../assets/projet/${encodeURIComponent(projectId)}.mov`;
    try {
      const resp = await fetch(mp4Url, { method: 'HEAD' });
      if (resp.ok) { mediaExt = 'mp4'; found = true; }
    } catch {}
    if (!found) {
      try {
        const resp = await fetch(movUrl, { method: 'HEAD' });
        if (resp.ok) { mediaExt = 'mov'; found = true; }
      } catch {}
    }
    if (!found) {
      const pngUrl = `../assets/projet/${encodeURIComponent(projectId)}.png`;
      try {
        const resp = await fetch(pngUrl, { method: 'HEAD' });
        if (resp.ok) { mediaExt = 'png'; found = true; }
      } catch {}
    }
    if (!found) return; // Aucun média trouvé
  } else {
    mediaExt = forceExt;
  }

  // --- Taille dynamique selon le média (récupère le vrai ratio pour image/vidéo) ---
  let aspect = 16/9;
  let realWidth = 0, realHeight = 0;
  // On affiche d'abord la frame avec le ratio par défaut
  frameWidth = Math.max(frameMinWidth, Math.min(420, Math.round(700 * aspect)));
  frameHeight = Math.round(frameWidth / aspect) + titlebarHeight;






const margin = 18;
const frameSpacing = 22;
const centerMarginX = window.innerWidth * 0.34; // plus large pour éviter le centre
const centerMarginY = window.innerHeight * 0.34;
const centerRect = {
  left: centerMarginX,
  right: window.innerWidth - centerMarginX,
  top: centerMarginY,
  bottom: window.innerHeight - centerMarginY
};

// Fonction shuffle (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

let left, top;
if (!isHover) {
  // Si une frame hover existe déjà pour ce projet, récupère sa position
  const hoverFrame = document.getElementById(`project-img-frame-${projectId}-hover`);
  if (hoverFrame) {
    const r = hoverFrame.getBoundingClientRect();
    left = r.left;
    top = r.top;
  }
}
if (left === undefined || top === undefined) {
  // Génère des positions candidates sur les bords (haut, bas, gauche, droite) avec offset aléatoire
  const candidates = [];
  const step = 30; // Espace entre chaque position candidate (plus fin)
  for (let y = margin; y < window.innerHeight - frameHeight - margin; y += step) {
    let offsetY = y + Math.floor(Math.random() * 20 - 10);
    candidates.push({ left: margin + Math.floor(Math.random() * 20), top: offsetY }); // gauche
    candidates.push({ left: window.innerWidth - frameWidth - margin + Math.floor(Math.random() * 20 - 10), top: offsetY }); // droite
  }
  for (let x = margin; x < window.innerWidth - frameWidth - margin; x += step) {
    let offsetX = x + Math.floor(Math.random() * 20 - 10);
    candidates.push({ left: offsetX, top: margin + Math.floor(Math.random() * 20) }); // haut
    candidates.push({ left: offsetX, top: window.innerHeight - frameHeight - margin + Math.floor(Math.random() * 20 - 10) }); // bas
  }
  shuffle(candidates);

  // Récupère toutes les frames déjà ouvertes (hover et pinned)
  const frames = Array.from(document.querySelectorAll('.project-img-frame'));

  // Fonction pour calculer le pourcentage d'overlap entre deux rectangles
  function overlapPercent(a, b) {
    const x_overlap = Math.max(0, Math.min(a.left + frameWidth, b.left + b.width) - Math.max(a.left, b.left));
    const y_overlap = Math.max(0, Math.min(a.top + frameHeight, b.top + b.height) - Math.max(a.top, b.top));
    const overlapArea = x_overlap * y_overlap;
    return overlapArea / (frameWidth * frameHeight);
  }

  const minGap = 36; // Ecart minimal plus grand pour plus d'air
  // Cherche une position valide
  left = undefined; top = undefined;
  for (const posOrig of candidates) {
    // Ajoute un offset aléatoire supplémentaire pour effet scattered
    const pos = { ...posOrig };
    if (Math.abs(pos.left - margin) < 30 || Math.abs(pos.left - (window.innerWidth - frameWidth - margin)) < 30) {
      pos.top += Math.floor(Math.random() * 24 - 12); // Décalage Y
    }
    if (Math.abs(pos.top - margin) < 30 || Math.abs(pos.top - (window.innerHeight - frameHeight - margin)) < 30) {
      pos.left += Math.floor(Math.random() * 24 - 12); // Décalage X
    }
    // 1. Évite le centre
    if (
      pos.left + frameWidth > centerRect.left &&
      pos.left < centerRect.right &&
      pos.top + frameHeight > centerRect.top &&
      pos.top < centerRect.bottom
    ) continue;

    // 2. Vérifie l'overlap avec toutes les frames ouvertes
    let valid = true;
    for (const f of frames) {
      const r = f.getBoundingClientRect();
      if (overlapPercent(pos, { left: r.left, top: r.top, width: r.width, height: r.height }) > 0.4) {
        valid = false;
        break;
      }
      // 3. Ecart minimal sur le même bord (gauche/droite: Y, haut/bas: X)
      // Bord gauche
      if (Math.abs(pos.left - margin) < 20 && Math.abs(pos.left - r.left) < 20) {
        if (Math.abs(pos.top - r.top) < frameHeight + minGap) {
          valid = false;
          break;
        }
      }
      // Bord droit
      if (Math.abs(pos.left - (window.innerWidth - frameWidth - margin)) < 20 && Math.abs(r.left - (window.innerWidth - frameWidth - margin)) < 20) {
        if (Math.abs(pos.top - r.top) < frameHeight + minGap) {
          valid = false;
          break;
        }
      }
      // Bord haut
      if (Math.abs(pos.top - margin) < 20 && Math.abs(pos.top - r.top) < 20) {
        if (Math.abs(pos.left - r.left) < frameWidth + minGap) {
          valid = false;
          break;
        }
      }
      // Bord bas
      if (Math.abs(pos.top - (window.innerHeight - frameHeight - margin)) < 20 && Math.abs(r.top - (window.innerHeight - frameHeight - margin)) < 20) {
        if (Math.abs(pos.left - r.left) < frameWidth + minGap) {
          valid = false;
          break;
        }
      }
    }
    if (valid) {
      left = pos.left;
      top = pos.top;
      break;
    }
  }
  // Si aucune position valide trouvée, tente explicitement le bord droit puis bas
  if (left === undefined || top === undefined) {
    // Bord droit
    let tryRight = { left: window.innerWidth - frameWidth - margin, top: margin };
    let overlap = false;
    for (const f of frames) {
      const r = f.getBoundingClientRect();
      if (overlapPercent(tryRight, { left: r.left, top: r.top, width: r.width, height: r.height }) > 0.4) {
        overlap = true;
        break;
      }
    }
    if (!overlap &&
      tryRight.left + frameWidth < window.innerWidth - margin &&
      tryRight.top + frameHeight < window.innerHeight - margin &&
      !isInCenterZone(tryRight.left, tryRight.top, frameWidth, frameHeight)
    ) {
      left = tryRight.left;
      top = tryRight.top;
    } else {
      // Bord bas
      let tryBottom = { left: margin, top: window.innerHeight - frameHeight - margin };
      overlap = false;
      for (const f of frames) {
        const r = f.getBoundingClientRect();
        if (overlapPercent(tryBottom, { left: r.left, top: r.top, width: r.width, height: r.height }) > 0.4) {
          overlap = true;
          break;
        }
      }
      if (!overlap &&
        tryBottom.left + frameWidth < window.innerWidth - margin &&
        tryBottom.top + frameHeight < window.innerHeight - margin &&
        !isInCenterZone(tryBottom.left, tryBottom.top, frameWidth, frameHeight)
      ) {
        left = tryBottom.left;
        top = tryBottom.top;
      } else {
        // Fallback final : haut gauche, mais décale si dans le centre
        let tryLeft = margin;
        let tryTop = margin;
        if (isInCenterZone(tryLeft, tryTop, frameWidth, frameHeight)) {
          // Décale sur le bord droit
          tryLeft = window.innerWidth - frameWidth - margin;
        }
        left = tryLeft;
        top = tryTop;
      }
    }
  }
}
// Si aucune position valide, place sur le bord droit en haut
if (top + frameHeight > window.innerHeight - margin) {
  top = margin;
  left = margin;
  // Empile sur le bord gauche
  frames.forEach(f => {
    const r = f.getBoundingClientRect();
    if (
      Math.abs(r.left - left) < frameSpacing &&
      Math.abs(r.top - top) < frameHeight + frameSpacing
    ) {
      top = r.bottom + frameSpacing;
    }
  });
}
// Si la frame est dans la zone centrale, décale sur le bord
if (
  left + frameWidth > centerMarginX &&
  left < window.innerWidth - centerMarginX &&
  top + frameHeight > centerMarginY &&
  top < window.innerHeight - centerMarginY
) {
  // Décale sur le bord droit
  left = window.innerWidth - frameWidth - margin;
  top = margin;
}
// --- Correction pour éviter tout débordement hors écran ---
left = Math.max(margin, Math.min(left, window.innerWidth - frameWidth - margin));
top = Math.max(margin, Math.min(top, window.innerHeight - frameHeight - margin));




// --- HTML média ---
  let mediaHtml = '';
  if (mediaExt === 'mp4' || mediaExt === 'mov') {
    mediaHtml = `<video id="project-media-${projectId}${isHover ? '-hover' : ''}" src="../assets/projet/${encodeURIComponent(projectId)}.${mediaExt}" style="width:100%;height:calc(100% - ${titlebarHeight}px);object-fit:cover;display:block;user-select:none;" autoplay loop muted playsinline></video>`;
  } else {
    mediaHtml = `<img id="project-media-${projectId}${isHover ? '-hover' : ''}" src="../assets/projet/${encodeURIComponent(projectId)}.png" style="width:100%;height:calc(100% - ${titlebarHeight}px);object-fit:cover;display:block;user-select:none;">`;
  }

  // --- Création de la frame ---
  let maxZ = 100;
  document.querySelectorAll('.project-img-frame').forEach(f => {
    const z = parseInt(f.style.zIndex || '100', 10);
    if (z > maxZ) maxZ = z;
  });
  frame = document.createElement('div');
  frame.id = frameId;
  frame.className = 'project-img-frame' + (isHover ? ' project-img-frame-hover' : '');
  frame.style.position = 'fixed';
  frame.style.zIndex = isHover ? (maxZ + 1).toString() : (maxZ + 2).toString();
  frame.style.pointerEvents = 'auto';
  frame.style.border = '1.5px solid #e0e0e0';
  frame.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
  frame.style.background = 'rgba(248,248,248,0.85)';
  frame.style.backdropFilter = 'blur(12px) saturate(1.2)';
  frame.style.borderRadius = '13px';
  frame.style.overflow = 'hidden';
  frame.style.transition = 'opacity 0.2s';
  frame.style.opacity = '1';
  frame.style.userSelect = 'none';
  frame.style.left = `${left}px`;
  frame.style.top = `${top}px`;
  frame.style.width = frameWidth + 'px';
  frame.style.height = frameHeight + 'px';
  // Utilise un id safe pour les éléments HTML (évite les espaces et caractères spéciaux)
  const safeId = String(projectId).replace(/[^a-zA-Z0-9_-]/g, '_');
  frame.innerHTML = `
    <div id="project-img-titlebar-${safeId}${isHover ? '-hover' : ''}" style="height:${titlebarHeight}px;display:flex;align-items:center;padding:0 16px;background:rgba(240,240,242,0.82);backdrop-filter:blur(10px);border-bottom:1px solid #e0e0e0;cursor:move;user-select:none;position:relative;">
      <img id="project-img-close-${safeId}${isHover ? '-hover' : ''}" src="../assets/icons_windowed/close.png" style="width:16px;height:16px;margin-right:8px;opacity:0.95;cursor:pointer;" draggable="false">
      <img src="../assets/icons_windowed/minimize.png" style="width:16px;height:16px;margin-right:8px;opacity:0.95;" draggable="false">
      <img src="../assets/icons_windowed/zoom.png" style="width:16px;height:16px;margin-right:16px;opacity:0.95;" draggable="false">
      <span style="font-family:Menlo,monospace;font-size:15px;font-weight:600;color:#60605a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">${projectLabel || projectId}</span>
      <img id="project-img-info-${safeId}${isHover ? '-hover' : ''}" src="../assets/icons_windowed/info.png" style="width:16px;height:16px;opacity:0.95;cursor:pointer;margin-left:8px;" draggable="false">
    </div>
    ${mediaHtml}
  `;
  document.body.appendChild(frame);

  // --- Fenêtre info projet (hover sur l'icône info) ---
  // Le texte info est maintenant dans le JSON de chaque projet (clé 'info')
  // window.projectsData doit être un tableau d'objets projet avec au moins { id, info }

  const infoBtn = frame.querySelector(`#project-img-info-${safeId}${isHover ? '-hover' : ''}`);
  let infoFrame = null;
  if (infoBtn) {
    infoBtn.addEventListener('mouseenter', function(e) {
      // Passe la fenêtre principale au premier plan
      let maxZ = 1;
      document.querySelectorAll('.project-img-frame').forEach(f => {
        const z = parseInt(f.style.zIndex || '1', 10);
        if (z > maxZ) maxZ = z;
      });
      frame.style.zIndex = (maxZ + 1).toString();
      // La bulle info est toujours juste au-dessus de la fenêtre image
      if (infoFrame) return;
      infoFrame = document.createElement('div');
      infoFrame.className = 'project-info-frame';
      infoFrame.style.position = 'fixed';
      infoFrame.style.zIndex = (parseInt(frame.style.zIndex, 10) + 1).toString();
      infoFrame.style.pointerEvents = 'auto';
      infoFrame.style.border = '1.5px solid #e0e0e0';
      infoFrame.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
      infoFrame.style.background = 'rgba(248,248,248,0.97)';
      infoFrame.style.backdropFilter = 'blur(12px) saturate(1.2)';
      infoFrame.style.borderRadius = '13px';
      infoFrame.style.overflow = 'hidden';
      infoFrame.style.transition = 'opacity 0.2s';
      infoFrame.style.opacity = '1';
      infoFrame.style.userSelect = 'text';
      infoFrame.style.minWidth = '220px';
      infoFrame.style.maxWidth = '340px';
      infoFrame.style.padding = '22px 22px 18px 22px';
      infoFrame.style.fontFamily = 'Menlo,monospace';
      infoFrame.style.fontSize = '15px';
      infoFrame.style.color = '#444';

      
      // Cherche le texte info dans le JSON global
      let infoText = "Aucune information disponible pour ce projet.";
      if (window.projectsData && Array.isArray(window.projectsData)) {
        const proj = window.projectsData.find(p => p.id === projectId);
        if (proj && proj.info_url) {
          infoText = `<a href='${proj.info_url}' target='_blank' style='color:#1a4b8a;text-decoration:underline;font-weight:bold;'>En savoir plus</a>`;
        } else if (proj && Object.prototype.hasOwnProperty.call(proj, 'info')) {
          infoText = proj.info;
        }
      }
      infoFrame.innerHTML = infoText;
      // Positionnement intelligent : en bas, sinon à gauche, sinon à droite
      const rect = frame.getBoundingClientRect();
      const infoRect = { width: 320, height: 120 };
      // Largeur/hauteur estimées (max)
      // 1. Essai en bas
      let left = rect.left + (rect.width-infoRect.width)/2;
      let top = rect.bottom + 12;
      // Corrige si dépasse à gauche/droite
      left = Math.max(12, Math.min(window.innerWidth-infoRect.width-12, left));
      // Si ça dépasse en bas, tente à gauche
      if (top+infoRect.height+12 > window.innerHeight) {
        left = rect.left - infoRect.width - 12;
        top = rect.top + (rect.height-infoRect.height)/2;
        // Si ça dépasse à gauche, tente à droite
        if (left < 12) {
          left = rect.right + 12;
          // Si ça dépasse à droite, force en haut
          if (left+infoRect.width+12 > window.innerWidth) {
            left = Math.max(12, Math.min(window.innerWidth-infoRect.width-12, rect.left + (rect.width-infoRect.width)/2));
            top = rect.top - infoRect.height - 12;
            if (top < 12) top = 12;
          }
        }
      }
      infoFrame.style.left = left + 'px';
      infoFrame.style.top = top + 'px';
      document.body.appendChild(infoFrame);
    });
    infoBtn.addEventListener('mouseleave', function(e) {
      if (infoFrame) {
        infoFrame.remove();
        infoFrame = null;
      }
    });
    // Si la souris va sur la frame info, ne pas la fermer
    document.addEventListener('mousemove', function moveInfo(e) {
      if (!infoFrame) return;
      const infoRect = infoFrame.getBoundingClientRect();
      if (e.target === infoFrame || infoFrame.contains(e.target)) return;
      if (e.target === infoBtn) return;
      // Si la souris sort de l'icône ET de la frame info, on ferme
      if (
        e.clientX < infoRect.left ||
        e.clientX > infoRect.right ||
        e.clientY < infoRect.top ||
        e.clientY > infoRect.bottom
      ) {
        infoFrame.remove();
        infoFrame = null;
        document.removeEventListener('mousemove', moveInfo);
      }
    });
  }

  // --- Drag & Drop ---
  const titlebar = frame.querySelector(`#project-img-titlebar-${safeId}${isHover ? '-hover' : ''}`);
  if (titlebar) {
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
    titlebar.onmousedown = function(e) {
      isDragging = true;
      dragOffsetX = e.clientX - frame.offsetLeft;
      dragOffsetY = e.clientY - frame.offsetTop;
      document.body.style.userSelect = 'none';
      function dragMove(ev) {
        if (isDragging) {
          let newLeft = ev.clientX - dragOffsetX;
          let newTop = ev.clientY - dragOffsetY;
          // Permet de sortir partiellement de l'écran (débordement autorisé)
          frame.style.left = newLeft + 'px';
          frame.style.top = newTop + 'px';
        }
      }
      function dragUp() {
        isDragging = false;
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragUp);
      }
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('mouseup', dragUp);
    };
  }

  // --- Resize (4 coins) ---
  const handles = [
    {id: 'nw', cursor: 'nwse-resize', style: 'left:4px;top:4px;'},
    {id: 'ne', cursor: 'nesw-resize', style: 'right:4px;top:4px;'},
    {id: 'sw', cursor: 'nesw-resize', style: 'left:4px;bottom:4px;'},
    {id: 'se', cursor: 'nwse-resize', style: 'right:4px;bottom:4px;'}
  ];
  handles.forEach(h => {
    let el = document.createElement('div');
    el.id = `project-img-resize-${h.id}-${projectId}${isHover ? '-hover' : ''}`;
    el.style.position = 'absolute';
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.zIndex = '3';
    el.style.cursor = h.cursor;
    el.style.background = 'rgba(200,200,200,0.18)';
    el.style.borderRadius = '4px';
    el.style[h.id.includes('n') ? 'top' : 'bottom'] = '4px';
    el.style[h.id.includes('w') ? 'left' : 'right'] = '4px';
    frame.appendChild(el);
    el.onmousedown = function(e) {
      let isResizing = true;
      let startX = e.clientX;
      let startY = e.clientY;
      let startW = frame.offsetWidth;
      let startH = frame.offsetHeight;
      let startL = frame.offsetLeft;
      let startT = frame.offsetTop;
      e.stopPropagation();
      document.body.style.userSelect = 'none';
      function resizeMove(ev) {
        if (isResizing) {
          let dx = ev.clientX - startX;
          let dy = ev.clientY - startY;
          let newW = Math.max(frameMinWidth, startW + (h.id.includes('e') ? dx : -dx));
          let newH = Math.max(frameMinHeight, startH + (h.id.includes('s') ? dy : -dy));
          let newL = h.id.includes('w') ? startL + dx : startL;
          let newT = h.id.includes('n') ? startT + dy : startT;
          frame.style.width = newW + 'px';
          frame.style.height = newH + 'px';
          frame.style.left = newL + 'px';
          frame.style.top = newT + 'px';
        }
      }
      function resizeUp() {
        isResizing = false;
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', resizeMove);
        document.removeEventListener('mouseup', resizeUp);
      }
      document.addEventListener('mousemove', resizeMove);
      document.addEventListener('mouseup', resizeUp);
    };
  });

  // --- Fermer la fenêtre ---
  const closeBtn = frame.querySelector(`#project-img-close-${safeId}${isHover ? '-hover' : ''}`);
  if (closeBtn) {
    // Supprime tous les anciens listeners pour éviter les doublons
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (isHover) {
        frame.remove();
      } else {
        removePinnedProjectFrame(projectId);
      }
    });
  } else {
    console.log('CROIX introuvable', `#project-img-close-${safeId}${isHover ? '-hover' : ''}`);
  }
  // Après avoir ajouté la frame au DOM et listeners, ajuste dynamiquement la taille quand le média est chargé
  setTimeout(() => {
    const mediaEl = document.getElementById(`project-media-${projectId}${isHover ? '-hover' : ''}`);
    if (mediaEl) {
      if (mediaExt === 'mp4' || mediaExt === 'mov') {
        mediaEl.onloadedmetadata = function() {
          if (mediaEl.videoWidth && mediaEl.videoHeight) {
            aspect = mediaEl.videoWidth / mediaEl.videoHeight;
            frameWidth = Math.max(frameMinWidth, Math.min(420, Math.round(700 * aspect)));
            frameHeight = Math.round(frameWidth / aspect) + titlebarHeight;
            // Correction anti-débordement après resize
            let newLeft = Math.max(margin, Math.min(frame.offsetLeft, window.innerWidth - frameWidth - margin));
            let newTop = Math.max(margin, Math.min(frame.offsetTop, window.innerHeight - frameHeight - margin));
            frame.style.width = frameWidth + 'px';
            frame.style.height = frameHeight + 'px';
            frame.style.left = newLeft + 'px';
            frame.style.top = newTop + 'px';
          }
        };
      } else {
        mediaEl.onload = function() {
          if (mediaEl.naturalWidth && mediaEl.naturalHeight) {
            aspect = mediaEl.naturalWidth / mediaEl.naturalHeight;
            frameWidth = Math.max(frameMinWidth, Math.min(420, Math.round(700 * aspect)));
            frameHeight = Math.round(frameWidth / aspect) + titlebarHeight;
            // Correction anti-débordement après resize
            let newLeft = Math.max(margin, Math.min(frame.offsetLeft, window.innerWidth - frameWidth - margin));
            let newTop = Math.max(margin, Math.min(frame.offsetTop, window.innerHeight - frameHeight - margin));
            frame.style.width = frameWidth + 'px';
            frame.style.height = frameHeight + 'px';
            frame.style.left = newLeft + 'px';
            frame.style.top = newTop + 'px';
          }
        };
      }
    }
  }, 0);
}








/// Hiding Hover
export function hideProjectImageFrame() {
  // Cache toutes les frames de hover uniquement
  document.querySelectorAll('.project-img-frame-hover').forEach(f => {
    const pinnedId = f.id.replace('-hover', '');
    const pinned = document.getElementById(pinnedId);
    if (pinned) {
      f.style.display = 'none';
    } else {
      f.style.display = 'none';
    }
  });
}

// Nourrit la liste des project cliqué (pinned/opened)
export function isProjectPinned(projectId) {
  return Array.isArray(window.pinnedProjects) && window.pinnedProjects.includes(projectId);
}

/// Clean la liste des project cliqué (pinned/opened)
export function removePinnedProjectFrame(projectId) {
  const frame = document.getElementById(`project-img-frame-${projectId}`);
  if (frame) {
    frame.remove();
  }
  if (Array.isArray(window.pinnedProjects)) {
    window.pinnedProjects = window.pinnedProjects.filter(id => id !== projectId);
  }
}
