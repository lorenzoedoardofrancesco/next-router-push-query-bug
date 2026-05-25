import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>router.push same-pathname-different-query repro</h1>
      <p>
        <Link href="/listings">Go to /listings</Link>
      </p>
    </main>
  );
}
