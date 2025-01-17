import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  OTPRecord: a
    .model({
      phoneNumber: a.string().required(),
      otp: a.string().required(),
      expiresAt: a.integer().required(),
      attempts: a.integer(),
    })
    .identifier(["phoneNumber"])
    .authorization((allow) => [allow.guest()]),
  UserInfo: a
    .model({
      userId: a.string().required(),
      userFullName: a.string().required(),
      userWhatsAppNumber: a.string().required(),
      userStatus: a.enum(["NEW", "ONBOARDED", "INACTIVE"]),
      authToken: a.string().required(),
    })
    .identifier(["userId"])
    .authorization((allow) => [allow.guest()]),

  Messages: a
    .model({
      caseId: a.string().required(),
      messageId: a.string().required(),
      userId: a.string().required(),
      messageDirection: a.enum(["INBOUND", "OUTBOUND"]),
      messageStatus: a.enum(["SENT", "DELIVERED", "READ", "RECEIVED"]),
      messageType: a.enum(["TEXT", "IMAGE", "INTERACTIVE"]),
      messageContent: a.string().required(),
    })
    .identifier(["caseId", "messageId"])
    .authorization((allow) => [allow.guest()]),
  ConnectionInfo: a
    .model({
      connectionId: a.string().required(),
      userId: a.string().required(),
      createdAt: a.string().required(),
      lastActiveAt: a.integer(),
    })
    .identifier(["connectionId"])
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});
