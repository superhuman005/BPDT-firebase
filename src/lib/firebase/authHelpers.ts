import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";

export const sendFirebasePasswordResetEmail = async (email: string): Promise<{ error: null | any }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null }; // ✅ return object with error key
  } catch (error: any) {
    return { error }; // ✅ catch and return the error
  }
};
