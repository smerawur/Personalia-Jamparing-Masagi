function StatCard({ title, value }) {
  return (
    <div className="bg-slate-900 text-white p-4 rounded-xl shadow">
      <p className="text-sm">{title}</p>
      <h3 className="text-xl font-semibold">{value}</h3>
    </div>
  );
}

export default StatCard;