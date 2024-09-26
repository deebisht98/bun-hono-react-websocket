import { AppType } from "@server/index";
import { BACKEND_DEV_URL } from "@shared/constants";
import { hc } from "hono/client";

export const honoClient = hc<AppType>(BACKEND_DEV_URL);
