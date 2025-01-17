import { defineFunction } from "@aws-amplify/backend";
export const connectController = defineFunction({
    name: "CONNECT_CONTROLLER",
    entry: "./handler.ts",
    timeoutSeconds: 300 // 5 minute timeout
});