import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { InlineError } from "./InlineError";
import type { AppErrorContent } from "../lib/errors";
import { showErrorToast, showValidationToast } from "../lib/errors";

type SchoolSetupProps = {
  compact?: boolean;
};

export function SchoolSetup({ compact = false }: SchoolSetupProps) {
  const [mode, setMode] = useState<"join" | "create">("join");
  const [schoolName, setSchoolName] = useState("");
  const [code, setCode] = useState("");
  const [joinRole, setJoinRole] = useState<"student" | "teacher">("student");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppErrorContent | null>(null);

  const createSchool = useMutation(api.schoolFunctions.createSchool);
  const joinSchool = useMutation(api.schoolFunctions.joinSchool);

  const handleCreate = async () => {
    if (schoolName.trim().length < 2) {
      showValidationToast({
        title: "School name required.",
        body: "Enter a school name with at least 2 characters.",
      });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await createSchool({ name: schoolName.trim() });
      toast.success(`School created. Invite code: ${result.code}`);
    } catch (err) {
      const content = {
        title: "We couldn't create the school.",
        body: err instanceof Error ? err.message : "Please try again.",
      };
      setError(content);
      showErrorToast(content);
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    if (code.trim().length < 4) {
      showValidationToast({
        title: "School code required.",
        body: "Ask your school admin for the invite code.",
      });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await joinSchool({ code: code.trim(), role: joinRole });
      toast.success("Joined school successfully");
    } catch (err) {
      const content = {
        title: "We couldn't join that school.",
        body: err instanceof Error ? err.message : "Check the code and try again.",
      };
      setError(content);
      showErrorToast(content);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${compact ? "p-4" : "p-6"}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-1">School Licensing</h2>
      <p className="text-sm text-gray-600 mb-4">
        Create a school as an admin, or join with a code as a student or teacher.
      </p>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode("join")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "join" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          Join school
        </button>
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "create" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          Create school
        </button>
      </div>

      {error && <InlineError {...error} className="mb-4" />}

      {mode === "create" ? (
        <div className="space-y-3">
          <input
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="School name"
            className="w-full p-3 border border-gray-300 rounded-lg"
            disabled={busy}
          />
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={busy}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create school (become School Admin)"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="School invite code"
            className="w-full p-3 border border-gray-300 rounded-lg uppercase"
            disabled={busy}
          />
          <select
            value={joinRole}
            onChange={(e) => setJoinRole(e.target.value as "student" | "teacher")}
            className="w-full p-3 border border-gray-300 rounded-lg"
            disabled={busy}
          >
            <option value="student">Join as Student</option>
            <option value="teacher">Join as Teacher</option>
          </select>
          <button
            type="button"
            onClick={() => void handleJoin()}
            disabled={busy}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {busy ? "Joining…" : "Join school"}
          </button>
        </div>
      )}
    </div>
  );
}

/** Small banner for solo learners who have not joined a school yet. */
export function SchoolSetupBanner() {
  const membership = useQuery(api.schoolFunctions.getMyMembership);
  const [open, setOpen] = useState(false);

  if (membership === undefined || membership !== null) return null;

  return (
    <div className="mb-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-medium text-blue-900">School licensing available</p>
          <p className="text-sm text-blue-800">
            Join your school or create one to unlock teacher and admin tools.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          {open ? "Hide" : "Set up school"}
        </button>
      </div>
      {open && (
        <div className="mt-4">
          <SchoolSetup compact />
        </div>
      )}
    </div>
  );
}
