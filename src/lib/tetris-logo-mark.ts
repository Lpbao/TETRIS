/** Hình học mark Tetris — khớp `public/logo.svg` (viewBox 0 54 512 404). */
export const TETRIS_LOGO_VIEW_X = 0;
export const TETRIS_LOGO_VIEW_Y = 54;
export const TETRIS_LOGO_VIEW_W = 512;
export const TETRIS_LOGO_VIEW_H = 404;

export const TETRIS_LOGO_BLOCKS = {
  top: { x: 0, y: 54, w: 174, h: 120 },
  mid: { x: 174, y: 174, w: 164, h: 164 },
  bot: { x: 338, y: 338, w: 174, h: 120 },
} as const;

/** Tỷ lệ cover loading — 120:164:120 = 30:41:30. Không đổi logo.svg. */
export const TETRIS_LOGO_H_RATIO = {
  top: 30,
  mid: 41,
  bot: 30,
} as const;

export const TETRIS_LOGO_H_RATIO_SUM =
  TETRIS_LOGO_H_RATIO.top + TETRIS_LOGO_H_RATIO.mid + TETRIS_LOGO_H_RATIO.bot;

export type TetrisLogoBlockId = keyof typeof TETRIS_LOGO_BLOCKS;

export type TetrisLogoBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Box khối trong viewBox — tỷ lệ 0–1 (y đã trừ VIEW_Y). */
export function tetrisLogoBlockLayout(id: TetrisLogoBlockId): TetrisLogoBox {
  const block = TETRIS_LOGO_BLOCKS[id];
  return {
    x: (block.x - TETRIS_LOGO_VIEW_X) / TETRIS_LOGO_VIEW_W,
    y: (block.y - TETRIS_LOGO_VIEW_Y) / TETRIS_LOGO_VIEW_H,
    w: block.w / TETRIS_LOGO_VIEW_W,
    h: block.h / TETRIS_LOGO_VIEW_H,
  };
}

/** Mid cắt đôi ngang — nửa trên thuộc TOP, nửa dưới thuộc BOT. */
export function tetrisLogoMidHalves(): { top: TetrisLogoBox; bot: TetrisLogoBox } {
  const mid = TETRIS_LOGO_BLOCKS.mid;
  const halfH = mid.h / 2;
  const x = (mid.x - TETRIS_LOGO_VIEW_X) / TETRIS_LOGO_VIEW_W;
  const w = mid.w / TETRIS_LOGO_VIEW_W;
  return {
    top: {
      x,
      y: (mid.y - TETRIS_LOGO_VIEW_Y) / TETRIS_LOGO_VIEW_H,
      w,
      h: halfH / TETRIS_LOGO_VIEW_H,
    },
    bot: {
      x,
      y: (mid.y - TETRIS_LOGO_VIEW_Y + halfH) / TETRIS_LOGO_VIEW_H,
      w,
      h: halfH / TETRIS_LOGO_VIEW_H,
    },
  };
}
