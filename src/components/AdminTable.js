export default function AdminTable({ title, type, data, headers, rowRenderer }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-2 text-gray-700">{title}</h2>

      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No {type}s found.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase">
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className="px-4 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr
                  key={i}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  {rowRenderer(item).map((cell, j) => (
                    <td key={j} className="px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
