import { useGame } from './hooks/useGame';
import { Home } from './ui/screens/Home';
import { NewGame } from './ui/screens/NewGame';
import { Rules } from './ui/screens/Rules';
import { Game } from './ui/screens/Game';
import { Result } from './ui/screens/Result';

/** Controlador del juego (hook) compartido entre pantallas. */
export type GameController = ReturnType<typeof useGame>;

export default function App() {
  const game = useGame();
  switch (game.screen) {
    case 'newgame':
      return <NewGame game={game} />;
    case 'rules':
      return <Rules game={game} />;
    case 'game':
      return <Game game={game} />;
    case 'result':
      return <Result game={game} />;
    default:
      return <Home game={game} />;
  }
}
