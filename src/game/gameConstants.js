// Board and piece configuration
export const BOARD_SIZE = 8;
export const BOARD_LEVELS = [0, 5];

export const RED_EDGE = 0xff4444;
export const BLUE_EDGE = 0x3366ff;

export const initialGameState = {
  currentPlayer: "red",
  pieces: [],
  logs: [],
  undoStack: [],
  winner: null,
};