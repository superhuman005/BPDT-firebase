import { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
