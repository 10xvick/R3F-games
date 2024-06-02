import { useEffect } from "react";

const inputmap: { [key: string]: Array<string> } = {
  left: ["ArrowLeft", "a"],
  right: ["ArrowRight", "d"],
  up: ["ArrowUp", "w"],
  down: ["ArrowDown", "s"],
};

export const useInput = (type: string, handler: (e: KeyboardEvent) => void) => {
  useEffect(() => {
    const h1: typeof handler = (e) => {
      if (inputmap[type]?.includes(e.key)) handler(e);
    };
    addEventListener("keydown", h1);
    return () => removeEventListener("keydown", h1);
  }, [type, handler]);
};
