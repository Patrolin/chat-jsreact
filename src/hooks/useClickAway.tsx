import { useCallback, useRef } from "react";

export function useClickAway(callback: (event: PointerEvent, inside: boolean) => void): (event: PointerEvent) => void {
  const isRegistered = useRef(false);
  const onClick = useCallback(
    (event: PointerEvent) => {
      // onClickAway
      const onClickAway = (event: PointerEvent) => {
        callback(event, false);
        window.removeEventListener("click", onClickAway);
        isRegistered.current = false;
      };
      // onClick
      event.stopPropagation();
      if (!isRegistered.current) {
        callback(event, true);
        window.addEventListener("click", onClickAway);
        isRegistered.current = true;
      }
    },
    [callback]
  );
  return onClick;
}
