// scripts/clear_dummy_data.js
import { query } from "../lib/db";

/**
 * Clears all dummy data inserted by the seed script.
 * This script should be run manually when you want to remove placeholder
 * courses, departments, users, and related syllabus data.
 */
export async function clearDummyData() {
  try {
    console.log("Clearing dummy data...");
    // Disable FK checks for safe truncation
    await query("SET FOREIGN_KEY_CHECKS = 0");

    // Delete from child tables first to avoid FK conflicts
    await query("DELETE FROM grading_components");
    await query("DELETE FROM weekly_plans");
    await query("DELETE FROM learning_outcomes");
    await query("DELETE FROM syllabi");
    await query("DELETE FROM enrollments");
    await query("DELETE FROM courses");
    await query("DELETE FROM programs");
    await query("DELETE FROM users");

    // Re‑enable FK checks
    await query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Dummy data cleared successfully.");
  } catch (err) {
    console.error("Error clearing dummy data:", err);
    // Ensure FK checks are re‑enabled even on error
    await query("SET FOREIGN_KEY_CHECKS = 1");
    throw err;
  }
}

// If this file is executed directly via node, run the function
if (require.main === module) {
  clearDummyData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
