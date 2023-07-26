const promotionModalTemplate = document.createElement("template");
promotionModalTemplate.innerHTML = String.raw`
<dialog id="promotion-dialog" class="promotion-dialog">
   <form class="promotion-form">
 
      <span>
         <button class="promote-btn" id="Queen" value="q" type="button">q</button>
         <button class="promote-btn" id="Rook" value="r" type="button">r</button>
         <button class="promote-btn" id="Bishop" value="b" type="button">b</button>
         <button class="promote-btn" id="Knight" value="n" type="button">n</button>
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

 .promote-btn {
   border: transparent;
   background-color: transparent;
   color: transparent;
   background-size: cover;
   cursor: pointer;
   width: var(--responsive-size);
   height: var(--responsive-size);
   padding: 0;
   transition: transform 200ms;
   transform-origin: center;
 }

 .promote-btn:hover {
   transform: scale(1.1);
 }

 .promote-btn:active {
   transform: scale(1.05);
 }
</style>
`;

export default class promotionDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(promotionModalTemplate.content.cloneNode(true));
    this.color = null;
    this.promotionDialog = this.shadowRoot.getElementById("promotion-dialog");
    this.promoteBtns = this.shadowRoot.querySelectorAll(".promote-btn");
  }

  connectedCallback() {}
}

window.customElements.define("promotion-dialog", promotionDialog);
