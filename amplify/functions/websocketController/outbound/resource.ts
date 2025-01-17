import { defineFunction } from "@aws-amplify/backend";
export const outboundController = defineFunction({
    name: "OUTBOUND_CONTROLLER",
    entry: "./handler.ts",
    timeoutSeconds: 300 // 5 minute timeout
});