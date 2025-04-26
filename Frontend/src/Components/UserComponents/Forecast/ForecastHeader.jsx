import PropTypes from "prop-types";

const ForecastHeader = ({ onGenerate, loading }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        📈 Forecast Overview
      </h2>
      <p className="text-gray-600 mb-6">
        Select a rice type to view its sales prediction for upcoming days.
      </p>

      <div className="relative w-full">
        <button
          onClick={onGenerate}
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all ${
            loading
              ? "opacity-70 cursor-not-allowed"
              : "hover:from-blue-700 hover:to-blue-600"
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Forecast...
            </>
          ) : (
            <>🔄 Generate Forecast</>
          )}
        </button>

        {/* Loading bar */}
        {loading && (
          <div className="mt-4 w-full bg-gray-200 rounded-full overflow-hidden h-3">
            <div className="bg-blue-500 h-full animate-loading-bar"></div>
          </div>
        )}
      </div>
    </div>
  );
};

ForecastHeader.propTypes = {
  onGenerate: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ForecastHeader;
