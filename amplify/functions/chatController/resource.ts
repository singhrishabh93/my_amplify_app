import { defineFunction } from "@aws-amplify/backend";
export const chatController = defineFunction({
    name: "CHAT_CONTROLLER",
    entry: "./handler.ts",
    timeoutSeconds: 300 // 5 minute timeout
});