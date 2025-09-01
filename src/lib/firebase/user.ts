// user.ts
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, setDoc, doc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export const createUserAndSaveToFirestore = async (
  email: string,
  password: string,
  fullName: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save additional data in Firestore
    await setDoc(doc(db, "profiles", user.uid), {
      email,
      full_name: fullName,
      created_at: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const resetUserPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/auth?type=recovery`,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};
