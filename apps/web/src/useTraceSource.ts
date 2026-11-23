import { useEffect, useState } from "react";

export function useTraceSource(
  source: string,
  language: string,
  snapshotHash?: string,
  snapshotLanguage?: string,
) {
  const [verified, setVerified] = useState<{
    source: string;
    hash: string | null;
  }>();
  const canCompare = !!snapshotHash && language === snapshotLanguage;
  useEffect(() => {
    if (!canCompare || !crypto.subtle) return;
    let active = true;
    void crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(source))
      .then((digest) => {
        const hash = Array.from(new Uint8Array(digest), (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
        if (active) setVerified({ source, hash });
      })
      .catch(() => {
        if (active) setVerified({ source, hash: null });
      });
    return () => {
      active = false;
    };
  }, [source, canCompare]);

  if (!snapshotHash || !snapshotLanguage || !crypto.subtle) return "unknown";
  if (language !== snapshotLanguage) return "changed";
  if (verified?.source !== source) return "pending";
  if (!verified.hash) return "unknown";
  return verified.hash === snapshotHash ? "match" : "changed";
}
