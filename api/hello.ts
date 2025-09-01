// api/hello.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../lib/firebase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const snapshot = await db.collection("users").get();

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
