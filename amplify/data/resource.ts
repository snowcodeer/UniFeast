import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Profile: a
    .model({
      id: a.id().required(),
      userName: a.string(),
      email: a.email(),
      userIdentity: a.enum(['student', 'staff', 'visitor']),
      dietaryPreferences: a.string(),
      periodPlan: a.string(),
      milkAllergy: a.boolean().default(false),
      eggsAllergy: a.boolean().default(false),
      peanutsAllergy: a.boolean().default(false),
      treeNutsAllergy: a.boolean().default(false),
      shellfishAllergy: a.boolean().default(false),
      otherAllergens: a.string(),
      // Remove created_at and updated_at, Amplify adds these automatically
    })
    .authorization(allow => [allow.owner()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  }
});