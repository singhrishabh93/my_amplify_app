import { defineFunction } from "@aws-amplify/backend";
export const otpController = defineFunction({
    name: "OTP_CONTROLLER",
    entry: "./handler.ts",
    timeoutSeconds: 300 // 5 minute timeout
});