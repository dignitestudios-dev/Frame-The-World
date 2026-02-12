import { Pencil } from "lucide-react";

interface FieldProps {
  label: string;
  value: string;
}

function InfoField({ label, value }: FieldProps) {
  return (
    <div className="flex items-center justify-between rounded-full bg-gray-100 px-4 py-3">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-blue-400">{value}</p>
      </div>
      <Pencil size={16} className="cursor-pointer text-blue-500" />
    </div>
  );
}

export default function AccountInformation() {
  return (
    <div className="flex-1 rounded-2xl bg-white p-6 shadow">
      <h1 className="mb-6 text-xl font-semibold text-center border-b pb-4">Account Information</h1>

      {/* Personal Information */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Personal Information
        </h2>
        <div className="space-y-3">
          <InfoField label="Name" value="Leo Denzin" />
          <InfoField label="Email" value="leo@gmail.com" />
          <InfoField label="IATA Number" value="123 - 456 - 7" />
          <InfoField label="CLIA Number" value="123 - 456 - 789 - 0" />
        </div>
      </section>

      {/* Company Information */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Company Information
        </h2>
        <div className="space-y-3">
          <InfoField label="Company Name" value="Travel Mania" />
          <InfoField label="Company Location" value="Miami, California" />
        </div>
      </section>
    </div>
  );
}
