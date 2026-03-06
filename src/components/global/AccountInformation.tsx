import { Pencil } from "lucide-react";
import { useState } from "react";

interface FieldProps {
  label: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
}

function InfoField({ label, value, editable, onChange }: FieldProps) {
  return (
    <div className="flex items-center justify-between rounded-full bg-gray-100 px-4 py-3">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        {editable ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm font-medium text-blue-400 bg-transparent border-none outline-none"
          />
        ) : (
          <p className="text-sm font-medium text-blue-400">{value}</p>
        )}
      </div>
      {!editable && <Pencil size={16} className="cursor-pointer text-blue-500" />}
    </div>
  );
}

export default function AccountInformation() {
  const [isEditing, setIsEditing] = useState(false);

  // State for each field value
  const [name, setName] = useState("Leo Denzin");
  const [email, setEmail] = useState("leo@gmail.com");
  const [iataNumber, setIataNumber] = useState("123 - 456 - 7");
  const [cliaNumber, setCliaNumber] = useState("123 - 456 - 789 - 0");
  const [companyName, setCompanyName] = useState("Travel Mania");
  const [companyLocation, setCompanyLocation] = useState("Miami, California");

  // Function to toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Function to save changes (you can replace this with actual save logic)
  const saveChanges = () => {
    console.log("Changes saved:");
    console.log({ name, email, iataNumber, cliaNumber, companyName, companyLocation });
    setIsEditing(false); // Exit edit mode after saving
  };

  return (
    <div className="flex-1 rounded-2xl bg-white p-6 shadow h-[785px] overflow-y-auto animate-in fade-in duration-300">
      {/* Account Information Header */}
      <div className="flex justify-center items-center mb-6 border-b pb-4">
        <h1 className="text-xl font-semibold text-gray-900">Account Information</h1>
        {/* {!isEditing && (
          <button
            onClick={toggleEditMode}
            className="text-blue-500 font-semibold"
          >
            Edit
          </button>
        )} */}
      </div>

      {/* Personal Information */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Personal Information</h2>
          {!isEditing && (
            <button
              onClick={toggleEditMode}
              className="text-blue-500 font-semibold"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-3">
          <InfoField
            label="Name"
            value={name}
            editable={isEditing}
            onChange={setName}
          />
          <InfoField
            label="Email"
            value={email}
            editable={isEditing}
            onChange={setEmail}
          />
          <InfoField
            label="IATA Number"
            value={iataNumber}
            editable={isEditing}
            onChange={setIataNumber}
          />
          <InfoField
            label="CLIA Number"
            value={cliaNumber}
            editable={isEditing}
            onChange={setCliaNumber}
          />
        </div>
      </section>

      {/* Company Information */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Company Information</h2>
        <div className="space-y-3">
          <InfoField
            label="Company Name"
            value={companyName}
            editable={isEditing}
            onChange={setCompanyName}
          />
          <InfoField
            label="Company Location"
            value={companyLocation}
            editable={isEditing}
            onChange={setCompanyLocation}
          />
        </div>
      </section>

      {/* Save Changes Button */}
      {isEditing && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveChanges}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
