import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Lightweight coverage check against generated players JSON embedded in TS
const src = readFileSync(new URL('../src/data/players.ts', import.meta.url), 'utf8');
const match = src.match(/export const PLAYERS: Player\[\] = (\[[\s\S]*?\]);/);
if (!match) throw new Error('players parse failed');
const players = JSON.parse(match[1]);

const franchises = [
  'ari','atl','bal','bos','chc','cws','cin','cle','col','det','hou','kc','laa','lad','mia','mil','min','nym','nyy','oak','phi','pit','sd','sf','sea','stl','tb','tex','tor','wsh',
];
const decades = ['1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];

const franchiseDecades = {
  ari: decades.slice(4),
  atl: decades, bal: decades, bos: decades, chc: decades, cws: decades, cin: decades, cle: decades,
  col: decades.slice(4),
  det: decades,
  hou: decades.slice(1),
  kc: decades.slice(1),
  laa: decades.slice(1),
  lad: decades,
  mia: decades.slice(4),
  mil: decades.slice(2),
  min: decades,
  nym: decades.slice(1),
  nyy: decades,
  oak: decades,
  phi: decades, pit: decades,
  sd: decades.slice(1),
  sf: decades,
  sea: decades.slice(2),
  stl: decades,
  tb: decades.slice(4),
  tex: decades.slice(1),
  tor: decades.slice(2),
  wsh: decades.slice(1),
};

let empty = 0;
const empties = [];
for (const f of franchises) {
  for (const d of franchiseDecades[f]) {
    const n = players.filter((p) => p.franchiseId === f && p.decade === d).length;
    if (n === 0) {
      empty++;
      empties.push(`${f}-${d}`);
    }
  }
}

const byPos = {};
for (const p of players) {
  for (const pos of p.positions) {
    byPos[pos] = (byPos[pos] || 0) + 1;
  }
}

console.log('players', players.length);
console.log('empty franchise-decade cells', empty);
console.log(empties.slice(0, 40).join(', '));
console.log('by position', byPos);
