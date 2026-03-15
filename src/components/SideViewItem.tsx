import { FC, PropsWithChildren } from "react";

type Props = {
  selected: boolean;
  onClick: () => void;
};
export const SideViewItem: FC<PropsWithChildren<Props>> = (props) => {
  const { selected, children, onClick } = props;
  return (
    <div
      className={`flex justify-between items-center py-2 px-4 border-b border-gray-400 hover:bg-gray-300 cursor-pointer ${selected ? "bg-gray-200" : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
