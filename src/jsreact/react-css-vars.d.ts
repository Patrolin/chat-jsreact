/* https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/74499 */
import "@types/react";
declare module "react" {
  interface CSSProperties { [key: `--${string}`]: string|number|undefined|null }
}
