import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase";



// Initialize Functions
const functions = getFunctions(app);

// Define Callable Function
export const sendIncompleteReminders = httpsCallable(functions, "sendIncompleteReminders");
