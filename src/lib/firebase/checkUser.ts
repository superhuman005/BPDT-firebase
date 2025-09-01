// checkUser.ts
import { db } from "./firebase"; // ✅ Correct relative path
import { doc, getDoc } from "firebase/firestore"; 




export async function checkUserExistsInDatabase(email: string): Promise<{ exists: boolean, isLegacy: boolean }> {
  try {
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);

    return {
      exists: docSnap.exists(),
      isLegacy: docSnap.exists() && !!docSnap.data()?.legacyUser,
    };
  } catch (error) {
    console.error("Error checking user:", error);
    throw error;
  }
}
