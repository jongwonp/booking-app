import type { PropsWithChildren, HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, children, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return <div {...rest} className={clsx("card", className)}>{children}</div>;
}
