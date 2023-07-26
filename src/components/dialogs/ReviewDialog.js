const reviewDialogTemplate = document.createElement("template");
reviewDialogTemplate.innerHTML = String.raw`
<dialog id="review-dialog" class="review-dialog">
   <form class="review-form">
<h2 class="title" id="review-title">Want to review?</h2>
<div id="undo-review-msg" class="msg"></div>
    <span class="btn-container">
        <button class="accept" value="accpet" type="button">Accept</button>
        <button class="decline" formmethod="dialog" type="button">Decline</button>
    </span>
</form>
</dialog>

<style>
   .review-dialog {
   background-color: white;
    border-radius: 8px;
    border: 3px solid black;
   }

 .review-form {
    display: grid;
    grid-template-areas: 
    "title"
    "msg"
    "btn";
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

export default class ReviewDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(reviewDialogTemplate.content.cloneNode(true));
    this.acceptButton = this.shadowRoot.querySelector(".accept");
    this.declineButton = this.shadowRoot.querySelector(".decline");
    this.title = this.shadowRoot.querySelector(".title");
    this.reviewDialog = this.shadowRoot.getElementById("review-dialog");
    this.reviewMsg = this.shadowRoot.getElementById("undo-review-msg");
    this.type = null;
  }

  connectedCallback() {}
}

window.customElements.define("review-dialog", ReviewDialog);
