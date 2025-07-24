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
      celery: a.boolean().default(false),
      gluten: a.boolean().default(false),
      crustaceans: a.boolean().default(false),
      fish: a.boolean().default(false),
      lupin: a.boolean().default(false),
      molluscs: a.boolean().default(false),
      mustard: a.boolean().default(false),
      sesame: a.boolean().default(false),
      soybeans: a.boolean().default(false),
      sulphites: a.boolean().default(false),
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