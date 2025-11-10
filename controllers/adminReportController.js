// controllers/adminReportController.js
import db from "../config/db.js";

export const getAdminReports = async (req, res) => {
  try {
    // Count athletes
    const athletesResult = await db.query(
      "SELECT COUNT(*) AS total FROM athletes"
    );
    const totalAthletes = Number(athletesResult.rows[0].total);

    // Count performances
    const performancesResult = await db.query("SELECT * FROM performances");
    const totalPerformances = performancesResult.rowCount;

    // Count injuries
    const injuriesResult = await db.query("SELECT * FROM injuries");
    const totalInjuries = injuriesResult.rowCount;

    // Prepare data for charts (simplified example)
    const performanceData = performancesResult.rows.map((p, i) => ({
      name: `Week ${i + 1}`,
      average: Number(p.result || 0),
    }));

    const injuryData = injuriesResult.rows.map((i) => ({
      name: new Date(i.reported_at).toLocaleString("default", {
        month: "short",
      }),
      injuries: 1,
    }));

    res.json({
      totalAthletes,
      totalPerformances,
      totalInjuries,
      performances: performanceData,
      injuries: injuryData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};
