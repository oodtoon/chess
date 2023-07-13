const copySvg = String.raw`<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 16 16"><path fill="currentColor" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path fill="currentColor" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>` 
const checkMarkSvg = String.raw`<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 12 16"><path fill-rule="evenodd" d="M12 5l-8 8l-4-4l1.5-1.5L4 10l6.5-6.5L12 5z" fill="currentColor"/></svg>`

const listTemplate = document.createElement("template")
listTemplate.innerHTML = String.raw`
  <h3>moves list</h3>
  <ol>
  </ol>
  <section class="btns-container">
    <button class="export">export pgn</button>
    <button class="copy">copy pgn <span class="copy-icon">${copySvg}</span></button>
    <button class="import">import pgn</button>
  </section>
  <style>

    h3 {
      text-align: center
    }

    ol {
      display: flex;
      flex-flow: row wrap;
      column-gap: 2rem;      
    }

    .btns-container{
      display: flex;
      justify-content: center;
    }

    @media(min-width: 1000px) {
      .btns-container{
      display: grid;
      justify-content: start;
    }
    }
   

    .btns-container > button {
      font-size: var(--font-size);
      font-weight: 800;
      padding: .5em 1em;
      margin: auto .5em 1em .5em;
      background-color: white;
    }

    .export {
      border: 3px solid #49a6e9;
      color: #49a6e9;
    }

    .copy {
      border: 3px solid brown;
      color: brown;
    }

    .import {
      border: 3px solid black;
      color: black;
    }

    .btns-container > button:hover {
      color: white;
      cursor: pointer;
      box-shadow: .2em .2em .2em black;
    }

    .export:hover {
      background-color: #49a6e9;
    }

    .copy:hover {
      background-color: brown;
    }

    .import:hover {
      background-color: black;
    }

    .icon {
      height: var(--font-size);
      width: var(--font-size);
    }
  </style>
`

class MoveList extends HTMLElement {
  style = {
    padding: "1em"
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.append(listTemplate.content.cloneNode(true))
    this.exportButton = this.shadowRoot.querySelector(".export")
    this.copyButton = this.shadowRoot.querySelector(".copy")
    this.importButton = this.shadowRoot.querySelector(".import")
    this.copyIcon = this.shadowRoot.querySelector(".copy-icon")
  }

  connectedCallback() {
    this.listRoot = this.shadowRoot.querySelector("ol")
    this.nextListItem()
    this.copyButton.addEventListener("click", () => {
      this.copyIcon.innerHTML = checkMarkSvg
      setTimeout(() => {
        this.copyIcon.innerHTML = copySvg
      }, 4000)
    })
  }

  addMove(move) {
    const moveSpan = document.createElement("span")
    moveSpan.style.flex = "1 0 auto"
    moveSpan.textContent = move + " "
    this.currentListItem.appendChild(moveSpan)
  }

  nextListItem() {
    this.currentListItem = document.createElement("li")
    this.listRoot?.appendChild(this.currentListItem)
  }
 
}



window.customElements.define("moves-list", MoveList)