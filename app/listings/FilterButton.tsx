"use client";

import { useRouter } from "next/navigation";

export function FilterButton() {
  const router = useRouter();
  const go = (url: string) => {
    console.log("[client] router.push", url);
    router.push(url);
  };
  return (
    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button type="button" onClick={() => go("/listings?regions=75")}>
        regions=75 (5000 rows default)
      </button>
      <button type="button" onClick={() => go("/listings?regions=33")}>
        regions=33 (5000 rows default)
      </button>
      <button type="button" onClick={() => go("/listings?regions=75&count=200")}>
        regions=75 count=200 (small)
      </button>
      <button type="button" onClick={() => go("/listings?regions=75&count=20000")}>
        regions=75 count=20000 (huge)
      </button>
      <button type="button" onClick={() => go("/listings")}>
        no params (count=0)
      </button>
    </div>
  );
}
