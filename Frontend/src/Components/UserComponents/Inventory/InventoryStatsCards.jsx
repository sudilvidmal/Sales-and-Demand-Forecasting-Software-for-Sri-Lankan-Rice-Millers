import PropTypes from "prop-types";

const InventoryStatsCards = ({ stats }) => {
  const cardList = [
    { label: "Total Rice Types", icon: "🧺", value: stats.totalTypes },
    { label: "Total Quantity (KG)", icon: "📦", value: stats.totalQuantity },
    { label: "Batches Today", icon: "🧾", value: stats.batchesToday },
    { label: "Batches This Month", icon: "📆", value: stats.batchesThisMonth },
    { label: "Low Stock Items", icon: "⚠️", value: stats.lowStockCount },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {cardList.map((card, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-4 hover:shadow-xl hover:scale-[1.02] transition-transform duration-300"
        >
          {/* Icon circle */}
          <div
            className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-sm"
            title={card.label}
          >
            {card.icon}
          </div>

          {/* Text content */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">{card.label}</span>
            <span className="text-xl font-bold text-gray-800">
              {card.value.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

InventoryStatsCards.propTypes = {
  stats: PropTypes.shape({
    totalTypes: PropTypes.number.isRequired,
    totalQuantity: PropTypes.number.isRequired,
    batchesToday: PropTypes.number.isRequired,
    batchesThisMonth: PropTypes.number.isRequired,
    lowStockCount: PropTypes.number.isRequired,
  }).isRequired,
};

export default InventoryStatsCards;
