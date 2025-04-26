import PropTypes from "prop-types";

const SummaryOverview = ({ data, riceType, fromDate, toDate }) => {
  const dateRangeLabel =
    fromDate && toDate
      ? `${fromDate} → ${toDate}`
      : typeof data.dateRange === "string"
      ? data.dateRange
      : `${data.dateRange.from} → ${data.dateRange.to}`;

  return (
    <div className="space-y-4">
      {/* ✅ Filter Context Display */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-600">
        <p>
          📅 Date Range: <strong>{dateRangeLabel}</strong>
        </p>
        <p>
          🍚 Rice Type: <strong>{riceType || "All"}</strong>
        </p>
      </div>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold">Total Sales (KG)</h3>
          <p className="text-xl">{data.totalSalesKG}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold">Total Revenue (Rs)</h3>
          <p className="text-xl">Rs. {data.totalRevenue?.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold">Most Sold</h3>
          <p className="text-md">{data.mostSold}</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold">Least Sold</h3>
          <p className="text-md">{data.leastSold}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold">Avg Qty / Day</h3>
          <p className="text-md">{data.averagePerDay} KG</p>
        </div>
        <div className="bg-gray-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold">Date Range</h3>
          <p className="text-md">{dateRangeLabel}</p>
        </div>
      </div>
    </div>
  );
};

SummaryOverview.propTypes = {
  data: PropTypes.shape({
    totalSalesKG: PropTypes.number.isRequired,
    totalRevenue: PropTypes.number,
    mostSold: PropTypes.string.isRequired,
    leastSold: PropTypes.string.isRequired,
    averagePerDay: PropTypes.number.isRequired,
    dateRange: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        from: PropTypes.string,
        to: PropTypes.string,
      }),
    ]).isRequired,
  }).isRequired,
  riceType: PropTypes.string,
  fromDate: PropTypes.string,
  toDate: PropTypes.string,
};

export default SummaryOverview;
