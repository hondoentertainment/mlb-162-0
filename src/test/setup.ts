import { PLAYERS } from '../data/players';
import { setPool } from '../data/pool';

// The player table is code-split in the app; tests exercise the draft logic
// synchronously, so prime the pool once up front.
setPool(PLAYERS);
