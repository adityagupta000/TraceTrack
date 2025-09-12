import React from "react";

export default function ItemTable({ items }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full table-fixed">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th className="w-1/4 px-4 py-3">ITEM</th>
            <th className="w-1/4 px-4 py-3">STATUS</th>
            <th className="w-1/4 px-4 py-3">LOCATION</th>
            <th className="w-1/4 px-4 py-3">CREATED AT</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                No items registered.
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr
                key={idx}
                className="border-t text-sm text-gray-800 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium break-words">
                  {item.name}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === "found"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 break-words">{item.location}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(item.created_at).toUTCString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
