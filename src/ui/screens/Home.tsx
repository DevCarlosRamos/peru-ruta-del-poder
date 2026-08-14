import type { GameController } from '../../App';

export function Home({ game }: { game: GameController }) {
  const { goTo, loadSaved } = game;

  return (
    <div className="screen home">
      <div className="home-hero">
        <div className="home-logo" aria-hidden="true">
          <span className="logo-ring">🗳️</span>
        </div>
        <h1 className="home-title">
          PERÚ: <span>LA RUTA DEL PODER</span>
        </h1>
        <p className="home-tagline">
          Juego de mesa digital de estrategia, economía y sátira política.
          <br />
          <em>Obra satírica original · Mayores de edad</em>
        </p>
        <div className="home-actions">
          <button className="btn btn-primary btn-big" onClick={() => goTo('newgame')}>
            ▶ Nueva partida
          </button>
          <button
            className="btn btn-secondary btn-big"
            onClick={() => {
              if (loadSaved()) {
                // se reanuda la partida guardada
              } else {
                alert('No hay partida guardada en este dispositivo.');
              }
            }}
          >
            ↺ Continuar partida
          </button>
          <button className="btn btn-ghost btn-big" onClick={() => goTo('rules')}>
            📜 Reglas
          </button>
        </div>
        <p className="home-note">
          Personajes históricos tratados como piezas satíricas de juego. Las estadísticas son
          mecánicas de juego, no evaluaciones de personas reales. Ninguna carta afirma
          culpabilidad real de nadie.
        </p>
      </div>
    </div>
  );
}
