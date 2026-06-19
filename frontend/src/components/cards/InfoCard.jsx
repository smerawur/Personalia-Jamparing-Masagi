function InfoCard({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border">
      <h3 className="text-lg font-semibold mb-3 text-slate-700">
        {title}
      </h3>

      <div className="text-sm text-slate-600 space-y-2">
        {children}
      </div>
    </div>
  );
}

export default InfoCard;