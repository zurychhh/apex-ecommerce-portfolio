import { json } from "@remix-run/node";

export const loader = async () => {
  return json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
};
