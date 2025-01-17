import { defineFunction } from "@aws-amplify/backend";

export const authController = defineFunction({
  name: "authController",
  entry: "./handler.ts",
  timeoutSeconds: 300,
});
