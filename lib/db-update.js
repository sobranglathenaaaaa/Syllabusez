import { query } from "./db";

export async function runMigrations() {
  try {
    console.log("Running database migrations for modern syllabus fields...");

    // Helper to check if a column exists
    const checkColumnExists = async (table, column) => {
      const rows = await query(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = ? 
           AND COLUMN_NAME = ?`,
        [table, column]
      );
      return rows.length > 0;
    };

    // Columns to add to `syllabi`
    const syllabiColumns = [
      { name: "course_description", type: "TEXT" },
      { name: "prerequisites", type: "TEXT" },
      { name: "corequisites", type: "TEXT" },
      { name: "semester", type: "VARCHAR(50)" },
      { name: "academic_year", type: "VARCHAR(50)" },
      { name: "vision", type: "TEXT" },
      { name: "mission", type: "TEXT" },
      { name: "quality_policy", type: "TEXT" },
      { name: "institutional_outcomes", type: "LONGTEXT" },
      { name: "program_outcomes", type: "LONGTEXT" },
      { name: "course_outcomes", type: "LONGTEXT" },
      { name: "performance_indicators", type: "LONGTEXT" },
      { name: "campus_goals", type: "LONGTEXT" }
    ];

    for (const col of syllabiColumns) {
      const exists = await checkColumnExists("syllabi", col.name);
      if (!exists) {
        console.log(`Adding column '${col.name}' to table 'syllabi'...`);
        await query(`ALTER TABLE syllabi ADD COLUMN ${col.name} ${col.type} DEFAULT NULL`);
      }
    }

    // Columns to add to `weekly_plans`
    const weeklyPlansColumns = [
      { name: "desired_learning_outcomes", type: "TEXT" },
      { name: "clo_alignment", type: "TEXT" },
      { name: "learning_content", type: "TEXT" },
      { name: "face_face", type: "TEXT" },
      { name: "synchronous", type: "TEXT" },
      { name: "asynchronous", type: "TEXT" }
    ];

    for (const col of weeklyPlansColumns) {
      const exists = await checkColumnExists("weekly_plans", col.name);
      if (!exists) {
        console.log(`Adding column '${col.name}' to table 'weekly_plans'...`);
        await query(`ALTER TABLE weekly_plans ADD COLUMN ${col.name} ${col.type} DEFAULT NULL`);
      }
    }

    // Columns to add to `courses`
    const coursesColumns = [
      { name: "year_level", type: "VARCHAR(50)" },
      { name: "semester", type: "VARCHAR(50)" },
      { name: "prereq", type: "TEXT" },
      { name: "coreq", type: "TEXT" }
    ];

    for (const col of coursesColumns) {
      const exists = await checkColumnExists("courses", col.name);
      if (!exists) {
        console.log(`Adding column '${col.name}' to table 'courses'...`);
        await query(`ALTER TABLE courses ADD COLUMN ${col.name} ${col.type} DEFAULT NULL`);
      }
    }

    console.log("Migrations check completed successfully.");
    return { success: true };
  } catch (error) {
    console.error("Migration error:", error);
    return { success: false, error: error.message };
  }
}
