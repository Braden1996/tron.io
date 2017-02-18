<menu>
  <h1>Lobby</h1>
  <section if={state.game === undefined}>
    Speed:
    <input type="text" name="menu_myname" onkeyup={editMySpeed} value={state.config.speed}><br />
    Name:
    <input type="text" name="menu_myname" onkeyup={editMyName} value={myName}><br />
    <button onclick={createLobby}>Create Lobby</button><br />
    <input type="text" name="menu_lobby_join">
    <button>Join Lobby</button>
  </section>
  <section if={state.game !== undefined}>
    Lobby code: <input type="text" name="menu_lobby_code" value="8241030a1abac52" disabled>
    <figure>
      <figcaption>Players:</figcaption>
      <ol>
        <li each={ state.game.players }>{ name || "Computer" }</li>
      </ol>
    </figure>
    <button id="menu__addcomputerplayer">Add computer player</button><br />
    <button id="menu__begingame" onclick={beginGame}>Begin Game</button>
  </section>

  <script>
    let imports = opts.imports;
    this.myName = "Player";

    this.state = opts.state;

    createLobby() {
      this.state.game = imports.createGameState(this.state.config);
      this.state.game.players[0].name = this.myName;
    }

    beginGame() {
      this.createLobby();
      this.state.game.started = true;
    }

    editMySpeed(e) {
      this.state.config.speed = e.target.value;
    }

    editMyName(e) {
      this.myName = e.target.value;
    }
  </script>

  <style>
    h3 { color: #444 }
    ul { color: #999 }
  </style>
</menu>