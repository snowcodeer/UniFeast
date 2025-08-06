// src/Profile.tsx
import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, Switch } from "react-native";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import { ProfileService } from "./services/ProfileService";

const client = generateClient<Schema>();

const DIETARY_OPTIONS = [
  "Halal",
  "Vegan",
  "Vegetarian",
  "Gluten-Free",
  "Kosher",
  "Dairy-Free",
  "Nut-Free",
];

const ALL_ALLERGENS = [
  { key: "milk_allergy", label: "Milk" },
  { key: "eggs_allergy", label: "Eggs" },
  { key: "peanuts_allergy", label: "Peanuts" },
  { key: "tree_nuts_allergy", label: "Tree nuts" },
  { key: "shellfish_allergy", label: "Shellfish" },
  { key: "celery", label: "Celery" },
  { key: "gluten", label: "Cereals containing gluten" },
  { key: "crustaceans", label: "Crustaceans" },
  { key: "fish", label: "Fish" },
  { key: "lupin", label: "Lupin" },
  { key: "molluscs", label: "Molluscs" },
  { key: "mustard", label: "Mustard" },
  { key: "sesame", label: "Sesame seeds" },
  { key: "soybeans", label: "Soybeans" },
  { key: "sulphites", label: "Sulphur dioxide and sulphites" },
];

// Helper functions to get main 5 allergens and extra allergens
const getMainAllergens = () => ALL_ALLERGENS.slice(0, 5);
const getExtraAllergens = () => ALL_ALLERGENS.slice(5);

const defaultProfile = {
  user_name: "",
  dietary_preferences: [] as string[],
  period_plan: "",
  milk_allergy: false,
  eggs_allergy: false,
  peanuts_allergy: false,
  tree_nuts_allergy: false,
  shellfish_allergy: false,
  other_allergies: "",
};

function ProfileForm({
  initialForm,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initialForm: Record<string, any>;
  onSubmit: (form: Record<string, any>) => void;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<Record<string, any>>({ ...initialForm });

  useEffect(() => {
    setForm({ ...initialForm });
  }, [initialForm]);

  const toggleDietary = (option: string) => {
    setForm(f => {
      const selected = f.dietary_preferences.includes(option)
        ? f.dietary_preferences.filter((o: string) => o !== option)
        : [...f.dietary_preferences, option];
      return { ...f, dietary_preferences: selected };
    });
  };

  const toggleAllergen = (key: string) => {
    setForm(f => ({ ...f, [key]: !f[key] }));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>{submitLabel} Profile</Text>
      <Text>Name:</Text>
      <TextInput
        value={form.user_name}
        onChangeText={v => setForm(f => ({ ...f, user_name: v }))}
        style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
      />
      <Text>Dietary Preferences:</Text>
      {DIETARY_OPTIONS.map(option => (
        <TouchableOpacity
          key={option}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
          onPress={() => toggleDietary(option)}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderWidth: 1,
              borderColor: "#333",
              marginRight: 8,
              backgroundColor: form.dietary_preferences.includes(option) ? "#333" : "#fff",
            }}
          />
          <Text>{option}</Text>
        </TouchableOpacity>
      ))}
      <Text>Period Plan:</Text>
      <TextInput
        value={form.period_plan}
        onChangeText={v => setForm(f => ({ ...f, period_plan: v }))}
        style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
      />
      <Text style={{ marginTop: 12, fontWeight: "bold" }}>Allergies (toggle):</Text>
      {ALL_ALLERGENS.map(allergen => (
        <View key={allergen.key} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Switch
            value={!!form[allergen.key]}
            onValueChange={() => toggleAllergen(allergen.key)}
          />
          <Text style={{ marginLeft: 8 }}>{allergen.label}</Text>
        </View>
      ))}
      <Button title={submitLabel} onPress={() => onSubmit(form)} />
      {onCancel && <Button title="Cancel" onPress={onCancel} color="gray" />}
    </ScrollView>
  );
}

const Profile = () => {
  const { user, signOut } = useAuthenticator();
  const [profile, setProfile] = useState<Schema["Profile"]["type"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const profileData = await ProfileService.getProfile(user.userId);
        if (profileData) {
          setProfile(profileData);
        }
        // If no profile exists, profileData will be null and we'll show the create form
      } catch (err: any) {
        setError(err.message || "Unknown error");
      }
    };
    fetchProfile();
  }, [user]);

  // When entering edit mode, prefill form with current profile
  const getFormFromProfile = (profile: Schema["Profile"]["type"]) => {
    // Handle main 5 allergens as booleans
    const mainAllergens = getMainAllergens().reduce((acc: Record<string, boolean>, a) => {
      acc[a.key] = !!(profile as any)[a.key];
      return acc;
    }, {} as Record<string, boolean>);
    // Handle extra allergens from other_allergies string
    const extraAllergens = getExtraAllergens().reduce((acc: Record<string, boolean>, a) => {
      acc[a.key] = profile.other_allergies?.includes(a.label) || false;
      return acc;
    }, {} as Record<string, boolean>);
    return {
      user_name: profile.user_name ?? "",
      dietary_preferences: profile.dietary_preferences
        ? profile.dietary_preferences.split(",").filter(Boolean)
        : [],
      period_plan: profile.period_plan ?? "",
      ...mainAllergens,
      ...extraAllergens,
    };
  };

  const handleCreate = async (form: Record<string, any>) => {
    try {
      // Collect extra allergens that are toggled on
      const other_allergies = getExtraAllergens()
        .filter((allergen: any) => form[allergen.key])
        .map((allergen: any) => allergen.label)
        .join(",");
      const created = await ProfileService.createProfile(
        user.userId,
        user.signInDetails?.loginId ?? ""
      );
      // Update the created profile with the form data
      const updated = await ProfileService.updateProfile({
        id: user.userId,
        user_name: form.user_name,
        dietary_preferences: form.dietary_preferences.join(","),
        period_plan: form.period_plan,
        milk_allergy: form.milk_allergy,
        eggs_allergy: form.eggs_allergy,
        peanuts_allergy: form.peanuts_allergy,
        tree_nuts_allergy: form.tree_nuts_allergy,
        shellfish_allergy: form.shellfish_allergy,
        other_allergies,
      });
      setProfile(updated);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };

  const handleUpdate = async (form: Record<string, any>) => {
    try {
      // Collect extra allergens that are toggled on
      const other_allergies = getExtraAllergens()
        .filter((allergen: any) => form[allergen.key])
        .map((allergen: any) => allergen.label)
        .join(",");
      const updated = await ProfileService.updateProfile({
        id: user.userId,
        user_name: form.user_name,
        dietary_preferences: form.dietary_preferences.join(","),
        period_plan: form.period_plan,
        milk_allergy: form.milk_allergy,
        eggs_allergy: form.eggs_allergy,
        peanuts_allergy: form.peanuts_allergy,
        tree_nuts_allergy: form.tree_nuts_allergy,
        shellfish_allergy: form.shellfish_allergy,
        other_allergies,
      });
      setProfile(updated);
      setEditing(false);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };

  if (error) return <Text>Error: {error}</Text>;
  if (!profile) {
    // Show form to create profile
    return (
      <ProfileForm
        initialForm={defaultProfile}
        onSubmit={handleCreate}
        submitLabel="Create"
      />
    );
  }

  if (editing) {
    return (
      <ProfileForm
        initialForm={getFormFromProfile(profile)}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
        submitLabel="Save"
      />
    );
  }

  // Show profile if it exists
  return (
    <View style={{ padding: 16 }}>
      <View style={{ alignSelf: "flex-end", marginBottom: 16 }}>
        <Button title="Sign Out" onPress={signOut} />
      </View>
      <Text>Email: {profile.email ?? "N/A"}</Text>
      <Text>Name: {profile.user_name ?? "N/A"}</Text>
      <Text>
        Dietary Preferences:{" "}
        {profile.dietary_preferences
          ? profile.dietary_preferences.split(",").filter(Boolean).join(", ")
          : "None"}
      </Text>
      <Text>Period Plan: {profile.period_plan ?? "N/A"}</Text>
      <Text style={{ marginTop: 12, fontWeight: "bold" }}>Allergies:</Text>
      <Text>
        {[
          ...getMainAllergens().filter((a: any) => (profile as any)[a.key]).map((a: any) => a.label),
          ...(profile.other_allergies ? profile.other_allergies.split(",").filter(Boolean) : [])
        ].join(", ") || "None"}
      </Text>
      <Button title="Edit Profile" onPress={() => setEditing(true)} />
    </View>
  );
};

export default Profile;
