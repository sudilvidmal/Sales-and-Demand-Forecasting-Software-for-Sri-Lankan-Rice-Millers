import PropTypes from "prop-types";

const InsightCards = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  const bestR2 = [...data].sort((a, b) => b.r2_score - a.r2_score)[0];
  const worstMAE = [...data].sort((a, b) => b.mae - a.mae)[0];
  const avgMAE = ( 
    data.reduce((sum, d) => sum + d.mae, 0) / data.length
  ).toFixed(2);
  const avgR2 = (
    data.reduce((sum, d) => sum + d.r2_score, 0) / data.length
  ).toFixed(3);

  const cards = [
    {
      label: "📈 Best R² Score",
      value: `${bestR2.r2_score.toFixed(3)} (${bestR2.rice_type})`,
      bg: "bg-green-100",
    },
    {
      label: "📉 Highest MAE",
      value: `${worstMAE.mae.toFixed(2)} (${worstMAE.rice_type})`,
      bg: "bg-red-100",
    },
    {
      label: "📊 Avg MAE",
      value: avgMAE,
      bg: "bg-blue-100",
    },
    {
      label: "📊 Avg R²",
      value: avgR2,
      bg: "bg-yellow-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className={`p-4 rounded shadow ${card.bg}`}>
          <p className="text-xs text-gray-600">{card.label}</p>
          <p className="text-lg font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

InsightCards.propTypes = {
  data: PropTypes.array.isRequired,
};

export default InsightCards;
