import PropTypes from "prop-types";

const AdminStatsCards = ({ stats }) => {
  const cardData = [
    {
      label: "Total Users",
      value: stats.totalUsers ?? 0,
      color: "bg-blue-100 text-blue-800",
    },
    {
      label: "Admins",
      value: stats.adminCount ?? 0,
      color: "bg-purple-100 text-purple-800",
    },
    {
      label: "Regular Users",
      value: stats.userCount ?? 0,
      color: "bg-green-100 text-green-800", 
    },
    {
      label: "Rice Types Managed",
      value: stats.riceTypes ?? 0,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      label: "Active Forecast Models",
      value: stats.activeModels ?? 0,
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      label: "Active Accounts",
      value: stats.activeAccounts ?? 0,
      color: "bg-teal-100 text-teal-800",
    },
    {
      label: "Inactive Accounts",
      value: stats.inactiveAccounts ?? 0,
      color: "bg-red-100 text-red-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      {cardData.map((card, index) => (
        <div
          key={index}
          className="rounded-xl shadow-md p-4 border border-gray-200 transition duration-300 hover:shadow-lg hover:-translate-y-1 bg-white"
        >
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            {card.label}
          </h3>
          <div
            className={`text-2xl font-semibold rounded px-2 py-1 inline-block ${card.color}`}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};

AdminStatsCards.propTypes = {
  stats: PropTypes.shape({
    totalUsers: PropTypes.number,
    adminCount: PropTypes.number,
    userCount: PropTypes.number,
    riceTypes: PropTypes.number,
    activeModels: PropTypes.number,
    activeAccounts: PropTypes.number,
    inactiveAccounts: PropTypes.number,
  }).isRequired,
};

export default AdminStatsCards;
