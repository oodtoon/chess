<script>
  class GameButtons extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.drawButton = document.querySelector(".draw");
      this.resignButton = document.querySelector(".resign");
      this.undoButton = document.querySelector(".undo");
    }

    connectedCallback() {}
  }
</script>

<div>
  <section class="btns-container dual">
    <button class="draw" type="button">Draw</button>
    <button class="resign" type="button">Resign</button>
  </section>
  <section class="btns-container">
    <button class="undo" type="button"
      >Undo Move <span>
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20"
          ><path
            fill="currentColor"
            fill-rule="evenodd"
            d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z"
            clip-rule="evenodd"
          /></svg
        >
      </span></button
    >
  </section>
</div>

<style>
  .btns-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }

  .btns-container > button {
    font-size: 1rem;
    font-weight: 800;
    padding: 0.5em 1em;
    margin: auto 0.5em 1em 0.5em;
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

  .undo {
    border: 3px solid black;
    color: black;
  }

  .btns-container > button:hover {
    color: white;
    cursor: pointer;
    box-shadow: 0em 0em 0em 0.1em white;
  }
  .draw:hover {
    background-color: #49a6e9;
  }

  .resign:hover {
    background-color: brown;
  }

  .undo:hover {
    background-color: black;
  }

  .icon {
    height: var(--element-size);
    weight: var(--font-weight);
  }
</style>
