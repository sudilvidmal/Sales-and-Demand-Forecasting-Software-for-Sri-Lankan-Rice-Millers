import PropTypes from "prop-types";
import React from "react";

// 🧩 Memoized Simple Skeleton Components
const SkeletonCard = React.memo(() => (
  <div className="bg-white p-5 rounded-lg shadow-md">
    <div className="h-16 skeleton rounded" />
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

const SkeletonSection = React.memo(({ height = "200px" }) => (
  <div className="bg-white rounded-lg shadow-md p-4" style={{ height }}>
    <div className="h-full skeleton rounded" />
  </div>
));
SkeletonSection.displayName = "SkeletonSection";

SkeletonSection.propTypes = {
  height: PropTypes.string,
};

const SkeletonTable = React.memo(({ rowCount = 5 }) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <div className="h-6 skeleton rounded mb-4" /> {/* Table Title */}
    <div className="h-8 skeleton rounded mb-2" /> {/* Table Header */}
    {Array.from({ length: rowCount }, (_, idx) => (
      <div key={idx} className="h-6 skeleton rounded mb-1" /> /* Table Rows */
    ))}
  </div>
));
SkeletonTable.displayName = "SkeletonTable";

SkeletonTable.propTypes = {
  rowCount: PropTypes.number,
};

const SkeletonAlerts = React.memo(() => (
  <div className="space-y-3">
    <div className="h-6 skeleton rounded w-1/4" />
    <div className="h-4 skeleton rounded w-3/4" />
    <div className="bg-white rounded-lg shadow-md p-4">
      {Array.from({ length: 3 }, (_, idx) => (
        <div key={idx} className="h-6 skeleton rounded mb-1" />
      ))}
    </div>
  </div>
));
SkeletonAlerts.displayName = "SkeletonAlerts";

// --------------------------------------------
// 🧩 Full Page Skeletons
// --------------------------------------------

const AdminInventorySkeleton = () => (
  <>
    <SkeletonTable rowCount={8} />
    <SkeletonTable rowCount={5} />
    <SkeletonTable rowCount={5} />
    <SkeletonSection height="300px" />
  </>
);

const ForecastModelSkeleton = () => (
  <>
    <SkeletonCard />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
    <SkeletonTable rowCount={6} />
    <SkeletonSection height="300px" />
    <SkeletonSection height="300px" />
    <SkeletonTable rowCount={8} />
  </>
);

const AdminUsersSkeleton = () => <SkeletonTable rowCount={8} />;

const AdminDashboardSkeleton = () => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
    <SkeletonSection height="400px" />
    <SkeletonTable rowCount={4} />
  </>
);

// ✅ NEW: SalesManagement Skeleton (simple version for KPI + Table only)
const SalesManagementSkeleton = () => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
    <SkeletonTable rowCount={8} />
  </>
);

const FullSalesPageSkeleton = () => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
    <SkeletonSection height="250px" />
    <SkeletonSection height="250px" />
    <SkeletonTable rowCount={8} />
    <SkeletonAlerts />
  </>
);

const ForecastSkeleton = () => (
  <>
    <SkeletonSection height="80px" />
    <SkeletonSection height="60px" />
    <SkeletonSection height="300px" />
    <SkeletonTable rowCount={8} />
  </>
);

const DataEntrySkeleton = () => (
  <>
    <SkeletonSection height="80px" />
    <SkeletonSection height="400px" />
  </>
);

const SearchDataSkeleton = () => (
  <>
    <SkeletonSection height="80px" />
    <SkeletonSection height="400px" />
  </>
);

const ReportSkeleton = () => (
  <>
    <SkeletonSection height="80px" />
    <SkeletonSection height="250px" />
    <SkeletonSection height="300px" />
    <SkeletonSection height="250px" />
    <SkeletonSection height="250px" />
  </>
);

const InventorySkeleton = () => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
    <SkeletonTable />
    <SkeletonTable />
    <SkeletonTable />
    <SkeletonSection height="300px" />
  </>
);

const DashboardSkeleton = () => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
    <SkeletonSection height="250px" />
    <SkeletonSection height="250px" />
  </>
);

const DefaultSkeleton = () => (
  <>
    <SkeletonSection height="300px" />
    <SkeletonSection height="400px" />
  </>
);

// --------------------------------------------
// 🧩 PageLoader Component
// --------------------------------------------

const PageLoader = ({ pageType = "default" }) => {
  const skeletons = {
    "admin-inventory": AdminInventorySkeleton,
    "forecast-model": ForecastModelSkeleton,
    "admin-users": AdminUsersSkeleton,
    "admin-dashboard": AdminDashboardSkeleton,
    sales: FullSalesPageSkeleton, // Full sales management + charts
    "sales-management": SalesManagementSkeleton, // Simpler sales KPI + table
    forecast: ForecastSkeleton,
    "data-entry": DataEntrySkeleton,
    "search-data": SearchDataSkeleton,
    report: ReportSkeleton,
    inventory: InventorySkeleton,
    dashboard: DashboardSkeleton,
    default: DefaultSkeleton,
  };

  const SkeletonComponent = skeletons[pageType] || DefaultSkeleton;

  return (
    <div
      className="flex flex-col gap-6 animate-pulse"
      aria-busy="true"
      aria-label={`Loading ${pageType} content`}
    >
      <SkeletonComponent />
    </div>
  );
};

PageLoader.propTypes = {
  pageType: PropTypes.oneOf([
    "default",
    "admin-inventory",
    "forecast-model",
    "admin-users",
    "admin-dashboard",
    "sales",
    "sales-management", 
    "forecast",
    "data-entry",
    "search-data",
    "report",
    "inventory",
    "dashboard",
  ]),
};

export default PageLoader;
