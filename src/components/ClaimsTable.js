export default function ClaimsTable({ claims }) {
  if (!claims.length) return <p className="text-gray-500">No claims yet.</p>;

  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th>Item</th>
            <th>Location</th>
            <th>Claimed At</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim.id} className="border-t hover:bg-gray-50">
              <td>{claim.item_name}</td>
              <td>{claim.location}</td>
              <td>{claim.claimed_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
