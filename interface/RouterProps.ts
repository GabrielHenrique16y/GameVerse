import { ReactNode } from "react";

export default interface MyRouteProps {
    children: ReactNode;
    IsClosed?: boolean;
}