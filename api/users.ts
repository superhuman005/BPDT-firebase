import { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../lib/firebase"; // this should be firebase-admin initialized

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const snapshot = await db.collection("users").get(); // <-- admin style
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
