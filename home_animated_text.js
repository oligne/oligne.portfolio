// home_animated_text.js

const phrases = [
  "> context’s needs meets users behaviors.",
  "> space becomes an interface through human–computer interaction.",
  "> physical and digital spaces hybridize into a single environment.",
  "> data and journeys are the mediums to sculpt",
  "> aesthetic explorations become one with technical solutions"
];

const staticText = "i design experience where";
let current = 0;
const staticContainer = document.getElementById("home-static-text");
const animatedContainer = document.getElementById("home-animated-text");

// Style du texte fixe (indépendant, centré)
if (staticContainer) {
  staticContainer.textContent = staticText;
  staticContainer.style.position = "fixed";
  staticContainer.style.top = "70px";
  staticContainer.style.left = "40%";
  staticContainer.style.transform = "translateX(-50%)";
  staticContainer.style.fontFamily = "Inter, Arial, sans-serif";
  staticContainer.style.fontSize = "1.15rem";
  staticContainer.style.color = "#111";
  staticContainer.style.fontWeight = "500";
  staticContainer.style.letterSpacing = "0.01em";
  staticContainer.style.whiteSpace = "nowrap";
  staticContainer.style.pointerEvents = "none";
  staticContainer.style.zIndex = "21";
  staticContainer.style.lineHeight = "1.2";
  staticContainer.style.verticalAlign = "middle";
  staticContainer.style.margin = "0";
  staticContainer.style.padding = "0";
}

function setPhrase(idx) {
  if (!animatedContainer || !staticContainer) return;
  const variableSpan = animatedContainer.querySelector('.animated-variable');
  if (variableSpan) variableSpan.style.opacity = 0;
  window.currentPhraseIndex = idx + 1; 
  setTimeout(() => {
    animatedContainer.innerHTML = `<span class='animated-variable' style='font-style:normal;color:#111;font-weight:500;transition:opacity 2s ease;white-space:nowrap;display:inline-block;vertical-align:middle;line-height:1.2;margin:0;padding:0;'>${phrases[idx]}</span>`;
    const newVariableSpan = animatedContainer.querySelector('.animated-variable');
    if (newVariableSpan) newVariableSpan.style.opacity = 1;
    // Positionne le texte animé à droite du texte fixe
    const staticRect = staticContainer.getBoundingClientRect();
    animatedContainer.style.position = "fixed";
    animatedContainer.style.top = (staticRect.top + 25) + "px";
    animatedContainer.style.left = "40%";
    animatedContainer.style.transform = "translateX(-10%)";
    animatedContainer.style.fontFamily = "Inter, Arial, sans-serif";
    animatedContainer.style.fontSize = "1.15rem";
    animatedContainer.style.color = "#111";
    animatedContainer.style.fontWeight = "500";
    animatedContainer.style.letterSpacing = "0.01em";
    animatedContainer.style.whiteSpace = "nowrap";
    animatedContainer.style.pointerEvents = "none";
    animatedContainer.style.lineHeight = "0";
    animatedContainer.style.verticalAlign = "middle";
    animatedContainer.style.margin = "0";
    animatedContainer.style.padding = "0";
    animatedContainer.style.zIndex = "21";
  }, 400);
}

function animateText() {
  setPhrase(current);
  setInterval(() => {
    current = (current + 1) % phrases.length;
    setPhrase(current);
    window.dispatchEvent(new Event('phraseIndexChanged'));
  }, 10000);
}

// Initialisation
setTimeout(() => {
  animateText();
}, 0);
