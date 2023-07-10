const undoReviewTemplate = document.createElement("template");
undoReviewTemplate.innerHTML = String.raw`
<div class="review-modal">
    <h2 class="title" id="review-title">White player wants to undo most recent move</h2>
    <div class="msg" id="undo-review-msg">Message message message message</div>
    <span class="btn-container">
        <button class="accept">Accept</button>
        <button class="decline">Decline</button>
    </span>
</div>

<style>
 .review-modal {
    display: grid;
    grid-template-areas: 
    "title"
    "msg"
    "btn";
    background-color: white;
    border-radius: 8px;
    border: 3px solid black;
    padding: 1em;
 }

 .title {
    grid-area: title;
    justify-self: center;
 }

 .msg {
    grid-area: msg;
    place-self: center;
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

 .decline {
    border: 3px solid brown;
    color: brown;
 }

 .accept:hover {
    color: white;
    background-color: #49a6e9;
 }

 .decline:hover {
    color: white;
    background-color: brown;
}

</style>
`;

export default class UndoReviewModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(undoReviewTemplate.content.cloneNode(true));
    this.acceptButton = this.shadowRoot.querySelector(".accept");
    this.declineButton = this.shadowRoot.querySelector(".decline");
    this.title = this.shadowRoot.querySelector(".title");
    this.msg = this.shadowRoot.querySelector(".msg")
  }

  connectedCallback() {}
}

window.customElements.define("undo-review-modal", UndoReviewModal);