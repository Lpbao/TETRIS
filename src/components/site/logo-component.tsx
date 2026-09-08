import type { CSSProperties } from "react";
import {
  type TetrisLogoBlockId,
  type TetrisLogoBox,
  tetrisLogoBlockLayout,
} from "@/lib/tetris-logo-mark";
import { cn } from "@/lib/utils";

function boxStyle(box: TetrisLogoBox): CSSProperties {
  return {
    left: `${box.x * 100}%`,
    top: `${box.y * 100}%`,
    width: `${box.w * 100}%`,
    height: `${box.h * 100}%`,
  };
}

const LOGO_BLOCKS: readonly TetrisLogoBlockId[] = ["top", "mid", "bot"];

interface LogoComponentProps {
  className?: string;
}

/**
 * 3 khối Tetris cứng (top / mid / bot).
 * Enter: cả khối trượt từ phải vào đích.
 * Scroll: face trượt từ đích ra phải rồi ẩn — không clip/co chiều rộng.
 */
export function LogoComponent({ className }: LogoComponentProps) {
  return (
    <div
      data-logo-component=""
      className={cn("pointer-events-none", className)}
      aria-hidden
    >
      {LOGO_BLOCKS.map((id) => (
        <span
          key={id}
          data-logo-block={id}
          style={boxStyle(tetrisLogoBlockLayout(id))}
        >
          <span data-logo-block-face="" />
        </span>
      ))}
    </div>
  );
}
