import { DOMProps } from "@/jsreact";
import { FC } from "react";

// https://fonts.google.com/icons?icon.style=Filled&icon.set=Material+Icons
type Props = {
  name: string;
} & Omit<DOMProps, "key">;
export const Icon: FC<Props> = (props) => {
  const { name, className = "", ...rest } = props;
  return (
    <span className={`material-icons ${className}`} {...rest}>
      {name}
    </span>
  );
};
