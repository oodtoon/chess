const crossTemplate = document.createElement("template");
crossTemplate.innerHTML = String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" class="ghost-move" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 896a384 384 0 1 0 0-768a384 384 0 0 0 0 768zm0 64a448 448 0 1 1 0-896a448 448 0 0 1 0 896z"></path><path fill="currentColor" d="M512 96a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V128a32 32 0 0 1 32-32zm0 576a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V704a32 32 0 0 1 32-32zM96 512a32 32 0 0 1 32-32h192a32 32 0 0 1 0 64H128a32 32 0 0 1-32-32zm576 0a32 32 0 0 1 32-32h192a32 32 0 1 1 0 64H704a32 32 0 0 1-32-32z"></path></svg>`;
const dotTemplate = document.createElement("template");
dotTemplate.innerHTML = String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="ghost-move" viewBox="0 0 256 256"><circle cx="127" cy="129" r="81" fill="currentColor" fill-rule="evenodd"/></svg>`;

export default class GhostMove extends HTMLElement {
  constructor() {
    super();
    this.potentialMove = null
  }

  connectedCallback() {
    
    if (this.potentialMove.capturedPiece) {
        const cross = crossTemplate.content.cloneNode(true);
        this.appendChild(cross);
    } else {
        const dot = dotTemplate.content.cloneNode(true);
        this.appendChild(dot) 
    }
    
  }
}

customElements.define("ghost-move", GhostMove);
