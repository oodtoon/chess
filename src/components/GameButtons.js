const gameButtonsTemplate = document.createElement("template");
gameButtonsTemplate.innerHTML = String.raw`
<section class="btns-container">
<button class="draw">Draw</button>
<button class="resign">Resign</button>
</section>
<style>
    .btns-container {
        display: flex;
        justify-content: center;
    }

    .btns-container > button {
      font-size: 1rem;
      font-weight: 800;
      padding: .5em 1em;
      margin: auto .5em 1em .5em;
      background-color: white;
    }

    .draw {
      border: 3px solid #49a6e9;
      color: #49a6e9;
    }

    .resign {
      border: 3px solid brown;
      color: brown;
    }

    .btns-container > button:hover {
      color: white;
      cursor: pointer;
      box-shadow: 0em 0em 0em .1em white;
    }
    .draw:hover {
      background-color: #49a6e9;
    }

    .resign:hover {
      background-color: brown;
    }
</style>
`;

class GameButtons extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(gameButtonsTemplate.content.cloneNode(true));
    this.drawButton = this.shadowRoot.querySelector(".draw")
    this.concedeButton = this.shadowRoot.querySelector(".resign")
    
  }

  connectedCallback() {
    this.appendChild(gameButtonsTemplate)
  }
}

window.customElements.define("game-buttons", GameButtons);
