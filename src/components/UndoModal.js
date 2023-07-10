const undoModalTemplate = document.createElement("template");
undoModalTemplate.innerHTML = String.raw`
<div class="undo-modal">
    <h2 class="title" id="undo-title">Send undo move request to opponent for approval.</h2>
    <section class="input">
        <label>Message to opponent:
        <textarea type="text" id="undo-msg"></textarea>
        <label>
    </section>
    
    <span class="btn-container">  
        <button class="request">Send Undo Request</button>
        <button class="cancel">Cancel</button>
    </span>
</div>

<style>
 .undo-modal {
    display: grid;
    grid-template-areas: 
    "title title"
    "input btn";
    background-color: white;
    border-radius: 8px;
    border: 3px solid black;
    align-items: center;
    justify-content: center;
    padding: 1em;
 }

 .title {
    grid-area: title;
    place-self: center;
 }

 .input {
    grid-area: input;
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

 .undo-request {
    border: 3px solid #49a6e9;
    color: #49a6e9;
 }


.cancel {
    border: 3px solid brown;
    color: brown;
}
 .undo-request:hover {
    color: white;
    background-color: #49a6e9;
 }

.cancel:hover {
    color: white;
    background-color: brown;
}
</style>
`;

export default class UndoModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(undoModalTemplate.content.cloneNode(true));
    this.requestButton = this.shadowRoot.querySelector(".request");
    this.cancelButton = this.shadowRoot.querySelector(".cancel");
    this.title = this.shadowRoot.querySelector(".title");
    this.textarea = this.shadowRoot.getElementById("undo-msg")
    this.msg = null
  }

  connectedCallback() {
    this.requestButton.addEventListener("click", () => {
        this.msg = this.textarea.value
    })
  }
}

window.customElements.define("undo-modal", UndoModal);
