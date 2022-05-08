import * as util from './util.js';
import * as cg from './types.js';

type Mobility = (x1: number, y1: number, x2: number, y2: number) => boolean;

function diff(a: number, b: number): number {
  return Math.abs(a - b);
}

function pawn(color: cg.Color): Mobility {
  return (x1, y1, x2, y2) =>
    diff(x1, x2) < 2 &&
    (color === 'white'
      ? // allow 2 squares from first two ranks, for horde
        y2 === y1 + 1 ||
        (y1 >= 5 && ((y2 === y1 + 1 && x1 === x2) || (y2 === y1 && x2 === x1 - 1) || (y2 === y1 && x2 === x1 + 1)))
      : y2 === y1 - 1 ||
        (y1 <= 4 && ((y2 === y1 - 1 && x1 === x2) || (y2 === y1 && x2 === x1 - 1) || (y2 === y1 && x2 === x1 + 1))));
}

const horse: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
};

const elephant: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return xd === 2 && yd === 2;
};

const advisor: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return xd === 1 && yd === 1;
};

const rook: Mobility = (x1, y1, x2, y2) => {
  return x1 === x2 || y1 === y2;
};

const canon: Mobility = (x1, y1, x2, y2) => {
  return rook(x1, y1, x2, y2);
};

const king: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return (xd === 1 && yd === 0) || (xd === 0 && yd === 1);
};

export function premove(pieces: cg.Pieces, key: cg.Key): cg.Key[] {
  const piece = pieces.get(key);
  if (!piece) return [];
  const pos = util.key2pos(key),
    r = piece.role,
    mobility: Mobility =
      r === 'pawn'
        ? pawn(piece.color)
        : r === 'horse'
        ? horse
        : r === 'elephant'
        ? elephant
        : r === 'advisor'
        ? advisor
        : r === 'rook'
        ? rook
        : r === 'canon'
        ? canon
        : king;

  return util.allPos
    .filter(pos2 => (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1]))
    .map(util.pos2key);
}
