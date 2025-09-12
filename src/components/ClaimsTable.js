import React from "react";

export default function ClaimsTable({ claims }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full table-fixed">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th className="w-1/3 px-4 py-3">ITEM</th>
            <th className="w-1/3 px-4 py-3">LOCATION</th>
            <th className="w-1/3 px-4 py-3">CLAIMED AT</th>
          </tr>
        </thead>
        <tbody>
          {claims.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">
                No claims yet.
              </td>
            </tr>
          ) : (
            claims.map((claim, idx) => (
              <tr
                key={idx}
                className="border-t text-sm text-gray-800 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium break-words">
                  {claim.item_name}
                </td>
                <td className="px-4 py-3 break-words">{claim.location}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(claim.claimed_at).toUTCString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
