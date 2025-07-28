// src/Profile.tsx
import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Picker } from "@react-native-picker/picker";
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
  { key: "milkAllergy", label: "Milk" },
  { key: "eggsAllergy", label: "Eggs" },
  { key: "peanutsAllergy", label: "Peanuts" },
  { key: "treeNutsAllergy", label: "Tree nuts" },
  { key: "shellfishAllergy", label: "Shellfish" },
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
  userIdentity: "student",
  userName: "",
  dietaryPreferences: [] as string[],
  periodPlan: "",
  milkAllergy: false,
  eggsAllergy: false,
  peanutsAllergy: false,
  treeNutsAllergy: false,
  shellfishAllergy: false,
  otherAllergens: "",
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
      const selected = f.dietaryPreferences.includes(option)
        ? f.dietaryPreferences.filter((o: string) => o !== option)
        : [...f.dietaryPreferences, option];
      return { ...f, dietaryPreferences: selected };
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
        value={form.userName}
        onChangeText={v => setForm(f => ({ ...f, userName: v }))}
        style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
      />
      <Text>Identity:</Text>
      <View style={{ borderWidth: 1, marginBottom: 8 }}>
        <Picker
          selectedValue={form.userIdentity}
          onValueChange={v => setForm(f => ({ ...f, userIdentity: v }))}
        >
          <Picker.Item label="Student" value="student" />
          <Picker.Item label="Staff" value="staff" />
          <Picker.Item label="Visitor" value="visitor" />
        </Picker>
      </View>
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
              backgroundColor: form.dietaryPreferences.includes(option) ? "#333" : "#fff",
            }}
          />
          <Text>{option}</Text>
        </TouchableOpacity>
      ))}
      <Text>Period Plan:</Text>
      <TextInput
        value={form.periodPlan}
        onChangeText={v => setForm(f => ({ ...f, periodPlan: v }))}
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
    // Handle extra allergens from otherAllergens string
    const extraAllergens = getExtraAllergens().reduce((acc: Record<string, boolean>, a) => {
      acc[a.key] = profile.otherAllergens?.includes(a.label) || false;
      return acc;
    }, {} as Record<string, boolean>);
    return {
      userIdentity: profile.userIdentity ?? "student",
      userName: profile.userName ?? "",
      dietaryPreferences: profile.dietaryPreferences
        ? profile.dietaryPreferences.split(",").filter(Boolean)
        : [],
      periodPlan: profile.periodPlan ?? "",
      ...mainAllergens,
      ...extraAllergens,
    };
  };

  const handleCreate = async (form: Record<string, any>) => {
    try {
      // Collect extra allergens that are toggled on
      const otherAllergens = getExtraAllergens()
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
        userName: form.userName,
        userIdentity: form.userIdentity as "student" | "staff" | "visitor",
        dietaryPreferences: form.dietaryPreferences.join(","),
        periodPlan: form.periodPlan,
        milkAllergy: form.milkAllergy,
        eggsAllergy: form.eggsAllergy,
        peanutsAllergy: form.peanutsAllergy,
        treeNutsAllergy: form.treeNutsAllergy,
        shellfishAllergy: form.shellfishAllergy,
        otherAllergens,
      });
      setProfile(updated);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };

  const handleUpdate = async (form: Record<string, any>) => {
    try {
      // Collect extra allergens that are toggled on
      const otherAllergens = getExtraAllergens()
        .filter((allergen: any) => form[allergen.key])
        .map((allergen: any) => allergen.label)
        .join(",");
      const updated = await ProfileService.updateProfile({
        id: user.userId,
        userName: form.userName,
        userIdentity: form.userIdentity as "student" | "staff" | "visitor",
        dietaryPreferences: form.dietaryPreferences.join(","),
        periodPlan: form.periodPlan,
        milkAllergy: form.milkAllergy,
        eggsAllergy: form.eggsAllergy,
        peanutsAllergy: form.peanutsAllergy,
        treeNutsAllergy: form.treeNutsAllergy,
        shellfishAllergy: form.shellfishAllergy,
        otherAllergens,
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
      <Text>Name: {profile.userName ?? "N/A"}</Text>
      <Text>Identity: {profile.userIdentity ?? "N/A"}</Text>
      <Text>
        Dietary Preferences:{" "}
        {profile.dietaryPreferences
          ? profile.dietaryPreferences.split(",").filter(Boolean).join(", ")
          : "None"}
      </Text>
      <Text>Period Plan: {profile.periodPlan ?? "N/A"}</Text>
      <Text style={{ marginTop: 12, fontWeight: "bold" }}>Allergies:</Text>
      <Text>
        {[
          ...getMainAllergens().filter((a: any) => (profile as any)[a.key]).map((a: any) => a.label),
          ...(profile.otherAllergens ? profile.otherAllergens.split(",").filter(Boolean) : [])
        ].join(", ") || "None"}
      </Text>
      <Button title="Edit Profile" onPress={() => setEditing(true)} />
    </View>
  );
};

export default Profile;
