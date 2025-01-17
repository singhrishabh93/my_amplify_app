import { defineFunction } from "@aws-amplify/backend";
export const inboundController = defineFunction({
    name: "INBOUND_CONTROLLER",
    entry: "./handler.ts",
    timeoutSeconds: 300 // 5 minute timeout
});