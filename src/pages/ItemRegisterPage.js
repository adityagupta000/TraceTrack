import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CameraIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterItemPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    status: "lost",
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select an image file.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    data.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Item registered successfully!");
        setTimeout(() => navigate("/lost-found-items"), 2000);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to register item.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Toast container */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="bg-white shadow-xl rounded-xl p-8 border">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-600 flex justify-center items-center gap-2">
            <CameraIcon className="w-6 h-6" />
            Register Lost / Found Item
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Submit the details to help match items with their rightful owners.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., Black Wallet"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Provide details like color, size, features..."
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Where was it found/lost?"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full"
            />
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preview
              </label>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-[400px] object-contain border rounded shadow"
              />
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Register Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
