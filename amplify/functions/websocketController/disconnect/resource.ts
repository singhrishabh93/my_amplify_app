import { defineFunction } from "@aws-amplify/backend";
export const disconnectController = defineFunction({
    name: "DISCONNECT_CONTROLLER",
    entry: "./handler.ts",
    timeoutSeconds: 300 // 5 minute timeout
});