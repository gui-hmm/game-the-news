import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps) {
  return <div className="border rounded-lg p-4 my-6 shadow">{children}</div>;
}

export function CardContent({ children }: CardProps) {
  return <div className="p-6 text-center mt-2">{children}</div>;
}
