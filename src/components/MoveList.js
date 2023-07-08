const listTemplate = document.createElement("template")
listTemplate.innerHTML = String.raw`
  <h3>moves list</h3>
  <ol>
  </ol>
  <style>
    h3 {
      text-align: center
    }
    ol {
      display: flex;
      flex-flow: row wrap;
      column-gap: 2rem;      
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
    console.log(this.shadowRoot)
  }

  connectedCallback() {
    this.listRoot = this.shadowRoot.querySelector("ol")
    console.log(this.listRoot)
    this.nextListItem()

    window.eventBus.addEventListener("piece-move", (event) => {
      if (this.currentListItem.children.length === 2) {
        this.nextListItem()
      }
      this.addMove(event.detail.notation)
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