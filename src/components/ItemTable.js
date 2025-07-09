export default function ItemTable({ items }) {
  if (!items.length) return <p className="text-gray-500">No items yet.</p>;

  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th className="px-4 py-2">Item</th>
            <th>Status</th>
            <th>Location</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-t hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-2 font-medium">{item.name}</td>
              <td>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    item.status === "found"
                      ? "bg-green-100 text-green-700"
                      : item.status === "claimed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td>{item.location}</td>
              <td>{item.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
