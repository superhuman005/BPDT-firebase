import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Upload, AlertTriangle } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

interface MigrationResult {
  email: string;
  status: "success" | "failed" | "skipped";
  error?: string;
  reason?: string;
  authUserId?: string;
  tempPassword?: string;
  role?: string;
}

interface MigrationResponse {
  success: boolean;
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
  results: MigrationResult[];
}

export const UserMigration = () => {
  const [loading, setLoading] = useState(false);
  const [specificUserId, setSpecificUserId] = useState("");
  const [migrationResults, setMigrationResults] = useState<MigrationResponse | null>(null);
  const { toast } = useToast();

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-10);
  };

  const migrateUser = async (userDoc: any) => {
    const email = userDoc.email;
    const tempPassword = generateTempPassword();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
      const uid = userCredential.user.uid;

      // Save metadata to Firestore (e.g. role)
      await db.collection("users").doc(uid).set({
        ...userDoc,
        migrated: true,
      });

      return {
        email,
        status: "success",
        authUserId: uid,
        tempPassword,
        role: userDoc.role || "user",
      };
    } catch (error: any) {
      return {
        email,
        status: "failed",
        error: error.message,
      };
    }
  };

  const handleMigrateAll = async () => {
    setLoading(true);
    const results: MigrationResult[] = [];
    let successCount = 0, failCount = 0, skipCount = 0;

    try {
      const snapshot = await getDocs(collection(db, "legacy_users"));
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      for (const user of docs) {
        if (!user.email) {
          results.push({ email: "-", status: "skipped", reason: "Missing email" });
          skipCount++;
          continue;
        }

        const result = await migrateUser(user);
        results.push(result);

        if (result.status === "success") successCount++;
        else if (result.status === "failed") failCount++;
      }

      setMigrationResults({
        success: true,
        summary: {
          total: docs.length,
          successful: successCount,
          failed: failCount,
          skipped: skipCount,
        },
        results,
      });

      toast({
        title: "Migration Completed",
        description: `Migrated ${successCount} users successfully.`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong during migration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateSpecific = async () => {
    if (!specificUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, "legacy_users", specificUserId);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        toast({
          title: "Not Found",
          description: "User not found in legacy_users collection",
          variant: "destructive",
        });
        return;
      }

      const result = await migrateUser(docSnap.data());

      setMigrationResults({
        success: true,
        summary: {
          total: 1,
          successful: result.status === "success" ? 1 : 0,
          failed: result.status === "failed" ? 1 : 0,
          skipped: result.status === "skipped" ? 1 : 0,
        },
        results: [result],
      });

      toast({
        title: "Migration Completed",
        description: `User migration ${result.status}.`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Migration failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "skipped":
        return <Badge variant="secondary">Skipped</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            User Migration to Firebase Auth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will migrate users from the legacy Firestore collection to Firebase Authentication with temporary passwords.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Migrate All Users</h3>
              <Button onClick={handleMigrateAll} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Migrate All Users
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Migrate Specific User</h3>
              <Label htmlFor="userId">User Document ID</Label>
              <Input
                id="userId"
                value={specificUserId}
                onChange={(e) => setSpecificUserId(e.target.value)}
                disabled={loading}
              />
              <Button
                onClick={handleMigrateSpecific}
                disabled={loading || !specificUserId.trim()}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  "Migrate User"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {migrationResults && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {["Total", "Successful", "Failed", "Skipped"].map((label, idx) => {
                const count = Object.values(migrationResults.summary)[idx];
                return (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600">{label}</div>
                  </div>
                );
              })}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Temp Password</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {migrationResults.results.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{result.email}</TableCell>
                    <TableCell>{getStatusBadge(result.status)}</TableCell>
                    <TableCell>{result.role}</TableCell>
                    <TableCell>
                      {result.tempPassword && (
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{result.tempPassword}</code>
                      )}
                    </TableCell>
                    <TableCell>{result.error || result.reason || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
