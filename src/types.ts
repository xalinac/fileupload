import { IncomingMessage, ServerResponse } from "http";

export interface Route {
  method: string;
  path: string | RegExp;
  handler: (req: IncomingMessage, res: ServerResponse) => void;
  auth?: boolean;
}