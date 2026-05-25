import { FilterButton } from "./FilterButton";

type FakeListing = {
  id: string;
  name: string;
  city: string;
  postal: string;
  phone: string;
  rating: number;
};

function generateListings(seed: string, count: number): FakeListing[] {
  const out: FakeListing[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: `${seed}-${i.toString().padStart(5, "0")}`,
      name: `Salon ${seed} #${i} ${"x".repeat(40)}`,
      city: `City-${seed}-${i % 50}`,
      postal: `${(parseInt(seed, 10) || 75) * 1000 + (i % 999)}`,
      phone: `+33 ${(100000000 + i).toString().slice(0, 9)}`,
      rating: ((i * 37) % 50) / 10,
    });
  }
  return out;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ regions?: string; count?: string }>;
}) {
  const sp = await searchParams;
  const count = sp.regions ? Number(sp.count ?? "5000") : 0;
  await new Promise((resolve) => setTimeout(resolve, 10));
  const listings = generateListings(sp.regions ?? "0", count);
  const renderedAt = new Date().toISOString();
  console.log("[server] /listings rendered", {
    regions: sp.regions ?? null,
    count,
    renderedAt,
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>Listings</h1>
      <p>
        <strong>regions=</strong>
        {sp.regions ?? "(none)"}
      </p>
      <p>
        <strong>count=</strong>
        {count}
      </p>
      <p>
        <strong>server-rendered-at=</strong>
        {renderedAt}
      </p>
      <FilterButton />
      <table style={{ marginTop: 16, borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>id</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>name</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>city</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>postal</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>phone</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>rating</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.name}</td>
              <td>{l.city}</td>
              <td>{l.postal}</td>
              <td>{l.phone}</td>
              <td>{l.rating.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
