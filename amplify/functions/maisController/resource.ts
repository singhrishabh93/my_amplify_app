import { defineFunction } from "@aws-amplify/backend";
export const MaisController = defineFunction({
  name: "MAIS_CONTROLLER",
  entry: "./handler.ts",
  timeoutSeconds: 300, // 5 minute timeout
});
