export default function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-4">
      <div className="text-xs uppercase tracking-wide text-brand.gray-500">{label}</div>
      <div className="text-2xl font-bold text-brand.gray-800">{value}</div>
    </div>
  );
}
