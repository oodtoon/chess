const promotionModalTemplate = document.createElement("template");
promotionModalTemplate.innerHTML = String.raw`
<dialog id="promotion-dialog" class="promotion-dialog">
   <form class="promotion-form">
        <label>
        Promote to:
        <select class="piece-select">
          <option>Queen</option>
          <option>Knight</option>
          <option>Bishop</option>
          <option>Rook</option>
        </select>
      </label>
    <span class="btn-container">
        <button class="accept" value="accpet">Accept</button>
    </span>
</form>
</dialog>

<style>
   .promotion-dialog {
    background-color: white;
    border-radius: 8px;
    border: 3px solid black;
   }

 .promotion-form {
    display: grid;
    grid-template-areas: 
    "title"
    "btn";
 }

 .title {
    grid-area: title;
    justify-self: center;
 }


 .btn-container {
    grid-area: btn;
    justify-self: center;
    margin: 0em 1em 1em 1em;
 }

 .btn-container > button {
    font-size: 1rem;
    font-weight: 800;
    margin: .25em;
    padding: .5em 1em;
    cursor: pointer;
    background-color: white;
 }

 .btn-container > button:hover {
    box-shadow: .2em .2em .2em black;
 }

 .accept {
    border: 3px solid #49a6e9;
    color: #49a6e9;
 }

 .accept:hover {
    color: white;
    background-color: #49a6e9;
 }
</style>
`;

export default class promotionDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(promotionModalTemplate.content.cloneNode(true));
    this.pieceSelect = this.shadowRoot.querySelector(".piece-select")
    this.acceptButton = this.shadowRoot.querySelector(".accept");
    this.promotionDialog = this.shadowRoot.getElementById("promotion-dialog");
  }

  connectedCallback() {
  }
}

window.customElements.define("promotion-dialog", promotionDialog);
