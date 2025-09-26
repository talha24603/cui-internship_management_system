import app from "../src/app";
import serverless from "serverless-http";

export const handler = serverless(app);
export default handler;
