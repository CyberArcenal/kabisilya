// src/seeders/seedData.js
//@ts-check
const { DataSource } = require("typeorm");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const { getDatabaseConfig } = require("../main/db/database");
const { SettingType, SystemSetting } = require("../entities/systemSettings");

// Import entity classes (for repository usage)
const Session = require("../entities/Session");
const Bukid = require("../entities/Bukid");
const Pitak = require("../entities/Pitak");
const Worker = require("../entities/Worker");
const Assignment = require("../entities/Assignment");
const Debt = require("../entities/Debt");
const DebtHistory = require("../entities/DebtHistory");
const Payment = require("../entities/Payment");
const PaymentHistory = require("../entities/PaymentHistory");

// Create a fresh data source for seeding
async function createSeedDataSource() {
  const config = getDatabaseConfig();

  const seedConfig = {
    ...config,
    entities: [
      Session,
      Bukid,
      Pitak,
      Worker,
      Assignment,
      Debt,
      DebtHistory,
      Payment,
      PaymentHistory,
      SystemSetting,
    ],
    synchronize: false,
    logging: false,
  };

  return new DataSource(seedConfig);
}

async function seedData() {
  console.log("🚀 Starting database seeding...");

  let seedDataSource;

  try {
    const shouldReset = process.argv.includes("--reset");

    if (shouldReset) {
      console.log("🔄 Resetting database before seeding...");
      await resetDatabase();
    }

    console.log("Creating seed data source...");
    seedDataSource = await createSeedDataSource();

    console.log("Initializing database...");
    await seedDataSource.initialize();
    console.log("✅ Database connected");

    // Disable foreign keys during seeding to avoid constraints
    await seedDataSource.query("PRAGMA foreign_keys = OFF");

    const queryRunner = seedDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Synchronize schema (create tables)
      await seedDataSource.synchronize();

      // Get repositories
      const sessionRepo = seedDataSource.getRepository(Session);
      const bukidRepo = seedDataSource.getRepository(Bukid);
      const pitakRepo = seedDataSource.getRepository(Pitak);
      const workerRepo = seedDataSource.getRepository(Worker);
      const assignmentRepo = seedDataSource.getRepository(Assignment);
      const debtRepo = seedDataSource.getRepository(Debt);
      const debtHistoryRepo = seedDataSource.getRepository(DebtHistory);
      const paymentRepo = seedDataSource.getRepository(Payment);
      const paymentHistoryRepo = seedDataSource.getRepository(PaymentHistory);
      const systemSettingRepo = seedDataSource.getRepository(SystemSetting);

      console.log("📅 Seeding Sessions...");
      const sessions = await seedSessions(sessionRepo);

      console.log("🏞️ Seeding Bukids...");
      const bukids = await seedBukids(bukidRepo, sessions);

      console.log("📍 Seeding Pitaks...");
      const pitaks = await seedPitaks(pitakRepo, bukids);

      console.log("👷 Seeding Workers...");
      const workers = await seedWorkers(workerRepo);

      console.log("📋 Seeding Assignments...");
      const assignments = await seedAssignments(
        assignmentRepo,
        workers,
        pitaks,
        sessions,
      );
      console.log("💰 Seeding Payments...");
      const payments = await seedPayments(
        paymentRepo,
        workers,
        pitaks,
        sessions,
      );
      console.log("📊 Seeding Payment History...");
      await seedPaymentHistory(paymentHistoryRepo, payments);
      console.log("💸 Seeding Debts...");
      const debts = await seedDebts(debtRepo, workers, sessions);

      console.log("📝 Seeding Debt History...");
      await seedDebtHistory(debtHistoryRepo, debts, payments);

      console.log("⚙️ Seeding System Settings...");
      await seedSystemSettings(systemSettingRepo, sessions);

      await queryRunner.commitTransaction();
      console.log("✅ Database seeding completed successfully!");

      console.log("\n📊 Summary:");
      console.log(`   Sessions: ${sessions.length}`);
      console.log(`   Bukids: ${bukids.length}`);
      console.log(`   Pitaks: ${pitaks.length}`);
      console.log(`   Workers: ${workers.length}`);
      console.log(`   Assignments: ${assignments.length}`);
      console.log(`   Debts: ${debts.length}`);
      console.log(`   Payments: ${payments.length}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Re-enable foreign keys
    await seedDataSource.query("PRAGMA foreign_keys = ON");

    await seedDataSource.destroy();
    console.log("✅ Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    if (seedDataSource && seedDataSource.isInitialized) {
      await seedDataSource.destroy().catch(() => {});
    }
    process.exit(1);
  }
}

async function resetDatabase() {
  try {
    console.log("🔄 Resetting database...");
    const { getDatabaseConfig } = require("../main/db/database");
    const config = getDatabaseConfig();
    const dbPath = config.database;

    console.log(`Database path: ${dbPath}`);
    if (dbPath && dbPath !== ":memory:" && fs.existsSync(dbPath)) {
      console.log(`🗑️  Deleting database file: ${dbPath}`);
      fs.unlinkSync(dbPath);
      console.log("✅ Database file deleted");
    }

    // Delete journal files
    const journalFiles = [
      `${dbPath}-journal`,
      `${dbPath}-wal`,
      `${dbPath}-shm`,
    ];
    journalFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch {
          /* ignore */
        }
      }
    });

    console.log("✅ Database reset complete");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  }
}

// ===================== SEED FUNCTIONS =====================

async function seedSessions(repo) {
  const sessions = [
    {
      name: "First Cropping 2024",
      seasonType: "tag-araw",
      year: 2024,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-06-30"),
      status: "closed",
    },
    {
      name: "Second Cropping 2024",
      seasonType: "tag-ulan",
      year: 2024,
      startDate: new Date("2024-07-01"),
      endDate: new Date("2024-12-31"),
      status: "archived",
    },
    {
      name: "First Cropping 2025",
      seasonType: "tag-araw",
      year: 2025,
      startDate: new Date("2025-01-01"),
      endDate: null,
      status: "active",
    },
    {
      name: "Second Cropping 2025",
      seasonType: "tag-ulan",
      year: 2025,
      startDate: new Date("2025-07-01"),
      endDate: null,
      status: "active",
    },
    {
      name: "Experimental Season",
      seasonType: "custom",
      year: 2025,
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-08-31"),
      status: "active",
    },
  ];

  return await repo.save(sessions);
}

async function seedBukids(repo, sessions) {
  const bukids = [
    {
      name: "North Field",
      status: "active",
      location: "North Section",
      session: sessions[0],
    }, // First Cropping 2024
    {
      name: "South Field",
      status: "active",
      location: "South Section",
      session: sessions[0],
    },
    {
      name: "East Field",
      status: "cancelled",
      location: "East Section",
      session: sessions[1],
    }, // Changed 'inactive' → 'cancelled'
    {
      name: "West Field",
      status: "active",
      location: "West Section",
      session: sessions[2],
    }, // First Cropping 2025
    {
      name: "Central Field",
      status: "active",
      location: "Central",
      session: sessions[3],
    }, // Second Cropping 2025
    {
      name: "Riverside",
      status: "active",
      location: "Near River",
      session: sessions[4],
    }, // Experimental
  ];
  return await repo.save(bukids);
}

async function seedPitaks(repo, bukids) {
  const pitaks = [
    {
      location: "Plot 1A",
      totalLuwang: 50,
      status: "active",
      bukid: bukids[0],
    },
    {
      location: "Plot 1B",
      totalLuwang: 45.5,
      status: "active",
      bukid: bukids[0],
    },
    {
      location: "Plot 2A",
      totalLuwang: 60,
      status: "completed",
      bukid: bukids[1],
    },
    {
      location: "Plot 2B",
      totalLuwang: 55,
      status: "active",
      bukid: bukids[1],
    },
    {
      location: "Plot 3A",
      totalLuwang: 30.25,
      status: "active",
      bukid: bukids[2],
    },
    {
      location: "Plot 4A",
      totalLuwang: 70,
      status: "active",
      bukid: bukids[3],
    },
    {
      location: "Plot 5A",
      totalLuwang: 40,
      status: "active",
      bukid: bukids[4],
    },
    {
      location: "Plot 6A",
      totalLuwang: 25,
      status: "active",
      bukid: bukids[5],
    },
    {
      location: "Plot 6B",
      totalLuwang: 35,
      status: "active",
      bukid: bukids[5],
    },
  ];
  return await repo.save(pitaks);
}

async function seedWorkers(repo) {
  const workers = [
    {
      name: "Juan Dela Cruz",
      contact: "09123456789",
      email: "juan@example.com",
      address: "Manila",
      status: "active",
      hireDate: new Date("2023-01-15"),
    },
    {
      name: "Maria Santos",
      contact: "09234567890",
      email: "maria@example.com",
      address: "Quezon City",
      status: "active",
      hireDate: new Date("2023-02-20"),
    },
    {
      name: "Pedro Reyes",
      contact: "09345678901",
      email: "pedro@example.com",
      address: "Cebu",
      status: "on-leave",
      hireDate: new Date("2022-11-10"),
    },
    {
      name: "Ana Garcia",
      contact: "09456789012",
      email: "ana@example.com",
      address: "Davao",
      status: "active",
      hireDate: new Date("2023-03-05"),
    },
    {
      name: "Luis Torres",
      contact: "09567890123",
      email: "luis@example.com",
      address: "Iloilo",
      status: "active",
      hireDate: new Date("2022-08-15"),
    },
    {
      name: "Elena Cruz",
      contact: "09678901234",
      email: "elena@example.com",
      address: "Baguio",
      status: "active",
      hireDate: new Date("2024-01-10"),
    },
    {
      name: "Ramon Diaz",
      contact: "09789012345",
      email: "ramon@example.com",
      address: "Pampanga",
      status: "inactive",
      hireDate: new Date("2023-09-01"),
    },
  ];
  return await repo.save(workers);
}

async function seedAssignments(repo, workers, pitaks, sessions) {
  const assignments = [
    {
      luwangCount: 10,
      assignmentDate: new Date("2024-01-15"),
      status: "completed",
      notes: "Completed on time",
      worker: workers[0],
      pitak: pitaks[0],
      session: sessions[0],
    },
    {
      luwangCount: 8.5,
      assignmentDate: new Date("2024-01-16"),
      status: "completed",
      worker: workers[0],
      pitak: pitaks[1],
      session: sessions[0],
    },
    {
      luwangCount: 12,
      assignmentDate: new Date("2024-02-01"),
      status: "cancelled",
      notes: "Cancelled due to weather",
      worker: workers[1],
      pitak: pitaks[2],
      session: sessions[0],
    },
    {
      luwangCount: 15,
      assignmentDate: new Date("2025-01-10"),
      status: "active",
      worker: workers[1],
      pitak: pitaks[5],
      session: sessions[2],
    },
    {
      luwangCount: 9,
      assignmentDate: new Date("2025-01-12"),
      status: "active",
      worker: workers[2],
      pitak: pitaks[5],
      session: sessions[2],
    },
    {
      luwangCount: 11,
      assignmentDate: new Date("2025-01-15"),
      status: "active",
      worker: workers[3],
      pitak: pitaks[6],
      session: sessions[3],
    },
    {
      luwangCount: 7,
      assignmentDate: new Date("2025-02-01"),
      status: "active",
      worker: workers[4],
      pitak: pitaks[7],
      session: sessions[4],
    },
    {
      luwangCount: 6,
      assignmentDate: new Date("2025-02-02"),
      status: "active",
      worker: workers[5],
      pitak: pitaks[8],
      session: sessions[4],
    },
  ];
  return await repo.save(assignments);
}

async function seedDebts(repo, workers, sessions) {
  const debts = [
    {
      originalAmount: 5000,
      amount: 5000,
      reason: "Medical expenses",
      balance: 500,
      status: "partially_paid",
      dateIncurred: new Date("2023-11-01"),
      dueDate: new Date("2024-03-01"),
      interestRate: 5,
      totalInterest: 250,
      totalPaid: 4500,
      lastPaymentDate: new Date("2024-01-10"),
      worker: workers[0],
      session: sessions[0],
    },
    {
      originalAmount: 3000,
      amount: 3000,
      reason: "Cash advance",
      balance: 200,
      status: "partially_paid",
      dateIncurred: new Date("2023-12-15"),
      dueDate: new Date("2024-02-15"),
      interestRate: 0,
      totalInterest: 0,
      totalPaid: 2800,
      lastPaymentDate: new Date("2024-01-15"),
      worker: workers[1],
      session: sessions[0],
    },
    {
      originalAmount: 1500,
      amount: 1500,
      reason: "Seed purchase",
      balance: 1500,
      status: "pending",
      dateIncurred: new Date("2025-01-05"),
      dueDate: new Date("2025-04-05"),
      interestRate: 0,
      totalInterest: 0,
      totalPaid: 0,
      lastPaymentDate: null,
      worker: workers[3],
      session: sessions[2],
    },
    {
      originalAmount: 2000,
      amount: 2000,
      reason: "Fertilizer loan",
      balance: 2000,
      status: "overdue",
      dateIncurred: new Date("2024-08-01"),
      dueDate: new Date("2024-11-01"),
      interestRate: 10,
      totalInterest: 200,
      totalPaid: 0,
      lastPaymentDate: null,
      worker: workers[2],
      session: sessions[1],
    },
    {
      originalAmount: 800,
      amount: 800,
      reason: "Transportation",
      balance: 400,
      status: "partially_paid",
      dateIncurred: new Date("2025-01-20"),
      dueDate: new Date("2025-02-20"),
      interestRate: 0,
      totalInterest: 0,
      totalPaid: 400,
      lastPaymentDate: new Date("2025-01-25"),
      worker: workers[4],
      session: sessions[4],
    },
  ];
  return await repo.save(debts);
}

async function seedDebtHistory(repo, debts, payments) {
  // Need payments array (will be passed after seeding payments, but we call this after payments)
  // We'll create history without payment link initially, then update after payments are created.
  // Better to create history after payments are seeded. We'll call this after payments.
  // For now, we'll assume payments array is passed.

  const histories = [
    {
      amountPaid: 1000,
      previousBalance: 5000,
      newBalance: 4000,
      transactionType: "payment",
      paymentMethod: "cash",
      notes: "Initial payment",
      transactionDate: new Date("2023-11-15"),
      debt: debts[0],
      payment: payments?.[0] || null,
    },
    {
      amountPaid: 500,
      previousBalance: 4000,
      newBalance: 3500,
      transactionType: "payment",
      paymentMethod: "salary_deduction",
      notes: "Salary deduction",
      transactionDate: new Date("2023-12-15"),
      debt: debts[0],
      payment: payments?.[1] || null,
    },
    {
      amountPaid: 3000,
      previousBalance: 3000,
      newBalance: 0,
      transactionType: "payment",
      paymentMethod: "cash",
      notes: "Full payment",
      transactionDate: new Date("2024-01-20"),
      debt: debts[1],
      payment: payments?.[2] || null,
    },
    {
      amountPaid: 400,
      previousBalance: 800,
      newBalance: 400,
      transactionType: "payment",
      paymentMethod: "gcash",
      notes: "Partial",
      transactionDate: new Date("2025-01-25"),
      debt: debts[4],
      payment: payments?.[5] || null,
    },
  ];
  return await repo.save(histories);
}

async function seedPayments(repo, workers, pitaks, sessions) {
  const payments = [
    {
      grossPay: 5000,
      manualDeduction: 200,
      netPay: 4800,
      status: "completed",
      paymentDate: new Date("2024-01-15"),
      paymentMethod: "cash",
      referenceNumber: "PAY-001",
      periodStart: new Date("2024-01-01"),
      periodEnd: new Date("2024-01-15"),
      totalDebtDeduction: 1500,
      otherDeductions: 200,
      deductionBreakdown: { debt: 1500, tax: 200 },
      notes: "Bi-weekly",
      worker: workers[0],
      pitak: pitaks[0],
      session: sessions[0],
    },
    {
      grossPay: 4500,
      manualDeduction: 100,
      netPay: 4400,
      status: "completed",
      paymentDate: new Date("2024-02-01"),
      paymentMethod: "bank_transfer",
      referenceNumber: "PAY-002",
      periodStart: new Date("2024-01-16"),
      periodEnd: new Date("2024-01-31"),
      totalDebtDeduction: 800,
      otherDeductions: 100,
      deductionBreakdown: { debt: 800, insurance: 100 },
      notes: "Second",
      worker: workers[1],
      pitak: pitaks[1],
      session: sessions[0],
    },
    {
      grossPay: 3000,
      manualDeduction: 0,
      netPay: 3000,
      status: "completed",
      paymentDate: new Date("2024-02-15"),
      paymentMethod: "cash",
      referenceNumber: "PAY-003",
      worker: workers[1],
      pitak: pitaks[2],
      session: sessions[0],
    },
    {
      grossPay: 6000,
      manualDeduction: 300,
      netPay: 5700,
      status: "pending",
      paymentDate: null,
      paymentMethod: null,
      referenceNumber: null,
      periodStart: new Date("2025-01-01"),
      periodEnd: new Date("2025-01-15"),
      totalDebtDeduction: 0,
      otherDeductions: 300,
      deductionBreakdown: { insurance: 300 },
      notes: "First 2025",
      worker: workers[3],
      pitak: pitaks[5],
      session: sessions[2],
    },
    {
      grossPay: 5500,
      manualDeduction: 0,
      netPay: 5500,
      status: "pending",
      paymentDate: null,
      worker: workers[4],
      pitak: pitaks[6],
      session: sessions[3],
    },
    {
      grossPay: 4200,
      manualDeduction: 0,
      netPay: 4200,
      status: "pending",
      paymentDate: null,
      worker: workers[5],
      pitak: pitaks[7],
      session: sessions[4],
    },
  ];
  return await repo.save(payments);
}

async function seedPaymentHistory(repo, payments) {
  const histories = [
    {
      actionType: "create",
      changedField: "grossPay",
      oldValue: null,
      newValue: "5000",
      oldAmount: 0,
      newAmount: 5000,
      notes: "Payment created",
      performedBy: "system",
      payment: payments[0],
      changeDate: new Date("2024-01-15"),
    },
    {
      actionType: "status_change",
      changedField: "status",
      oldValue: "pending",
      newValue: "completed",
      notes: "Marked completed",
      performedBy: "manager",
      payment: payments[0],
      changeDate: new Date("2024-01-16"),
    },
    {
      actionType: "debt_deduction",
      changedField: "netPay",
      oldAmount: 4800,
      newAmount: 3300,
      notes: "Debt deducted",
      performedBy: "system",
      payment: payments[0],
      changeDate: new Date("2024-01-15"),
    },
    {
      actionType: "create",
      changedField: "grossPay",
      oldValue: null,
      newValue: "4500",
      oldAmount: 0,
      newAmount: 4500,
      payment: payments[1],
      changeDate: new Date("2024-02-01"),
    },
  ];
  return await repo.save(histories);
}

async function seedSystemSettings(repo, sessions) {
  // Find active session (status = 'active')
  const activeSession =
    sessions.find((s) => s.status === "active") || sessions[2];
  const settings = [
    {
      key: "company_name",
      value: "Farm Management System",
      setting_type: SettingType.GENERAL,
      description: "Name of the company/farm",
      is_public: true,
      is_deleted: false,
    },
    {
      key: "default_currency",
      value: "PHP",
      setting_type: SettingType.GENERAL,
      description: "Default currency",
      is_public: true,
      is_deleted: false,
    },
    {
      key: "default_session_id",
      value: String(activeSession.id),
      setting_type: SettingType.FARM_SESSION,
      description: "Default session ID",
      is_public: false,
      is_deleted: false,
    },
    {
      key: "require_default_session",
      value: "true",
      setting_type: SettingType.FARM_SESSION,
      description: "Require default session",
      is_public: false,
      is_deleted: false,
    },
    {
      key: "rate_per_luwang",
      value: "230",
      setting_type: SettingType.FARM_PAYMENT,
      description: "Rate per luwang",
      is_public: false,
      is_deleted: false,
    },
    {
      key: "debt_allocation_strategy",
      value: "auto",
      setting_type: SettingType.FARM_DEBT,
      description: "Debt allocation strategy",
      is_public: false,
      is_deleted: false,
    },
  ];
  return await repo.save(settings);
}

// Run if executed directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
