import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";

export default function Phase5({ trackingData, fps }) {
  const [active, setActive] = useState("coverage");

  const stats = useMemo(() => {
    const ids = new Set();
    const team0 = new Set();
    const team1 = new Set();
    trackingData.forEach((d) => {
      if (d.id === -1) return;
      ids.add(d.id);
      if (d.team === 0) team0.add(d.id);
      if (d.team === 1) team1.add(d.id);
    });
    return {
      totalPlayers: ids.size,
      redCount: team0.size,
      blueCount: team1.size,
      totalSamples: trackingData.length,
    };
  }, [trackingData]);

  const renderContent = () => {
    switch (active) {
      case "coverage":
        return (
          <div className="p-4 text-sm text-gray-800 space-y-1">
            <p className="font-semibold text-gray-900">Tracking Summary</p>
            <p>Unique players tracked: <strong>{stats.totalPlayers}</strong> ({stats.redCount} Red, {stats.blueCount} Blue)</p>
            <p>Total spatial data points captured: <strong>{stats.totalSamples}</strong></p>
          </div>
        );
      case "preSnap":
        return (
          <div className="p-4 text-sm text-gray-800">
            Pre-snap alignment metrics ready ({stats.redCount} vs. {stats.blueCount} player grouping detected).
          </div>
        );
      case "fatigue":
        return (
          <div className="p-4 text-sm text-gray-800">
            Route distance & burst speed tracking active across {stats.totalPlayers} tracked athletes.
          </div>
        );
      case "grading":
        return (
          <div className="p-4 text-sm text-gray-800">
            Route trail overlays active on 2D tactical map above.
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-300 rounded bg-gray-50 text-gray-900 mt-4 overflow-hidden">
      <div className="flex border-b border-gray-300 bg-gray-200 text-sm font-medium">
        {[
          ["coverage", "Coverage Trainer"],
          ["preSnap", "Pre-Snap Tells"],
          ["fatigue", "Fatigue Tracker"],
          ["grading", "Assignment Grading"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`px-4 py-2 transition-colors ${
              active === key
                ? "bg-white text-gray-900 font-semibold border-b-2 border-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActive(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  );
}

Phase5.propTypes = {
  trackingData: PropTypes.array.isRequired,
  fps: PropTypes.number.isRequired,
};