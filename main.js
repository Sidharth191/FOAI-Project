import { Game } from './game.js';

export class Main {
  static game = null;

  static {
    if (typeof window !== 'undefined') {
      window.addEventListener('DOMContentLoaded', () => {
        Main.init();
      });
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        Main.init();
      }
    }
  }

  static init() {
    if (Main.game) {
      return Main.game;
    }
    Main.game = new Game('app');
    Main.game.start();
    return Main.game;
  }
}
