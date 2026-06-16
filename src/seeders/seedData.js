// src/seeders/seedData.js
// @ts-check
const { DataSource } = require("typeorm");
const fs = require("fs");
const { getDatabaseConfig } = require("../main/db/database");
const { SettingType, SystemSetting } = require("../entities/systemSettings");

// Import entity classes
const Session = require("../entities/Session");
const Bukid = require("../entities/Bukid");
const Pitak = require("../entities/Pitak");
const Worker = require("../entities/Worker");
const Assignment = require("../entities/Assignment");
const Debt = require("../entities/Debt");
const DebtHistory = require("../entities/DebtHistory");
const DebtPayment = require("../entities/DebtPayment"); // ✅ BAGO
const Payment = require("../entities/Payment");
const PaymentHistory = require("../entities/PaymentHistory");

// ---------- Helper functions ----------
/**
 * @param {number} min
 * @param {number} max
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {Date} start
 * @param {Date} end
 */
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

/**
 * @param {string | any[]} arr
 */
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @param {number} min
 * @param {number} max
 */
function randomDecimal(min, max, decimals = 2) {
  const val = min + Math.random() * (max - min);
  return parseFloat(val.toFixed(decimals));
}

// ---------- Seeder main ----------
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
      DebtPayment, // ✅ BAGO
      Payment,
      PaymentHistory,
      SystemSetting,
    ],
    synchronize: false,
    logging: false,
  };
  // @ts-ignore
  return new DataSource(seedConfig);
}

async function seedData() {
  console.log("🚀 Starting database seeding (ENHANCED VERSION)...");
  let seedDataSource;
  try {
    const shouldReset =
      process.argv.includes("--reset") || process.argv.includes("reset");
    console.log(`Reset flag: ${shouldReset}`);

    if (shouldReset) {
      console.log("🔄 Resetting database before seeding...");
      await resetDatabase();
    }

    seedDataSource = await createSeedDataSource();
    await seedDataSource.initialize();
    console.log("✅ Database connected");

    await seedDataSource.query("PRAGMA foreign_keys = OFF");
    const queryRunner = seedDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await seedDataSource.synchronize();

      const sessionRepo = seedDataSource.getRepository(Session);
      const bukidRepo = seedDataSource.getRepository(Bukid);
      const pitakRepo = seedDataSource.getRepository(Pitak);
      const workerRepo = seedDataSource.getRepository(Worker);
      const assignmentRepo = seedDataSource.getRepository(Assignment);
      const debtRepo = seedDataSource.getRepository(Debt);
      const debtHistoryRepo = seedDataSource.getRepository(DebtHistory);
      const debtPaymentRepo = seedDataSource.getRepository(DebtPayment); // ✅ BAGO
      const paymentRepo = seedDataSource.getRepository(Payment);
      const paymentHistoryRepo = seedDataSource.getRepository(PaymentHistory);
      const systemSettingRepo = seedDataSource.getRepository(SystemSetting);

      // ------------------------------------------------------------------
      // 1. SESSIONS
      // ------------------------------------------------------------------
      console.log("📅 Seeding Sessions...");
      const sessions = [
        {
          name: "First Cropping 2023",
          seasonType: "tag-araw",
          year: 2023,
          startDate: new Date("2023-01-01"),
          endDate: new Date("2023-06-30"),
          status: "archived",
        },
        {
          name: "Second Cropping 2023",
          seasonType: "tag-ulan",
          year: 2023,
          startDate: new Date("2023-07-01"),
          endDate: new Date("2023-12-31"),
          status: "archived",
        },
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
          status: "closed",
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
      ];
      const savedSessions = await sessionRepo.save(sessions);
      console.log(`   Created ${savedSessions.length} sessions`);

      // ------------------------------------------------------------------
      // 2. BUKIDS
      // ------------------------------------------------------------------
      console.log("🏞️ Seeding Bukids...");
      const bukidNames = [
        "North Field",
        "South Field",
        "East Field",
        "West Field",
        "Central Field",
        "Riverside",
        "Upland",
        "Lowland",
        "Irrigated",
        "Rainfed",
        "Organic",
        "Demo Farm",
      ];
      const bukids = [];
      for (let i = 0; i < bukidNames.length; i++) {
        const session = savedSessions[i % savedSessions.length];
        bukids.push({
          name: bukidNames[i],
          status: randomElement([
            "active",
            "active",
            "active",
            "completed",
            "cancelled",
          ]),
          location: `${bukidNames[i]} Area`,
          notes: `Notes for ${bukidNames[i]}`,
          session,
        });
      }
      const savedBukids = await bukidRepo.save(bukids);
      console.log(`   Created ${savedBukids.length} bukids`);

      // ------------------------------------------------------------------
      // 3. PITAKS
      // ------------------------------------------------------------------
      console.log("📍 Seeding Pitaks...");
      const pitaks = [];
      for (const bukid of savedBukids) {
        const numPitaks = randomInt(5, 8);
        for (let p = 1; p <= numPitaks; p++) {
          pitaks.push({
            location: `Plot ${String.fromCharCode(64 + p)}-${bukid.id}`,
            totalLuwang: randomDecimal(20, 150, 1),
            layoutType: randomElement(["square", "rectangle", "triangle"]),
            areaSqm: randomDecimal(500, 5000, 0),
            status: randomElement(["active", "active", "completed"]),
            bukid,
          });
        }
      }
      const savedPitaks = await pitakRepo.save(pitaks);
      console.log(`   Created ${savedPitaks.length} pitaks`);

      // ------------------------------------------------------------------
      // 4. WORKERS
      // ------------------------------------------------------------------
      console.log("👷 Seeding Workers...");
      const firstNames = [
        "Juan",
        "Maria",
        "Pedro",
        "Ana",
        "Luis",
        "Elena",
        "Ramon",
        "Carla",
        "Jose",
        "Rosa",
        "Manuel",
        "Teresa",
        "Antonio",
        "Carmen",
        "Francisco",
        "Isabel",
        "Emilio",
        "Gloria",
        "Ricardo",
        "Luz",
      ];
      const lastNames = [
        "Dela Cruz",
        "Santos",
        "Reyes",
        "Garcia",
        "Torres",
        "Cruz",
        "Mendoza",
        "Villanueva",
        "Fernandez",
        "Lopez",
        "Gonzales",
        "Ramirez",
        "Flores",
        "Rivera",
        "Perez",
        "Tan",
        "Aquino",
        "Lim",
        "Chua",
        "Aguilar",
      ];
      const workers = [];
      const usedEmails = new Set();
      for (let i = 0; i < 50; i++) {
        const firstName = randomElement(firstNames);
        const lastName = randomElement(lastNames);
        let name = `${firstName} ${lastName}`;
        let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@example.com`;
        while (usedEmails.has(email))
          email = `${firstName.toLowerCase()}${randomInt(1, 999)}@farm.com`;
        usedEmails.add(email);
        workers.push({
          name,
          contact: `09${randomInt(100000000, 999999999)}`,
          email,
          address: `${randomElement(["Manila", "Quezon City", "Cebu", "Davao", "Iloilo", "Baguio", "Pampanga", "Laguna"])}`,
          status: randomElement([
            "active",
            "active",
            "active",
            "inactive",
            "on-leave",
          ]),
          hireDate: randomDate(new Date("2020-01-01"), new Date("2025-01-01")),
        });
      }
      const savedWorkers = await workerRepo.save(workers);
      console.log(`   Created ${savedWorkers.length} workers`);

      // ------------------------------------------------------------------
      // 5. ASSIGNMENTS
      // ------------------------------------------------------------------
      console.log("📋 Seeding Assignments...");
      const assignments = [];
      const assignmentStatuses = [
        "initiated",
        "active",
        "completed",
        "cancelled",
      ];
      for (const worker of savedWorkers) {
        const numAssign = randomInt(2, 5);
        for (let a = 0; a < numAssign; a++) {
          const pitak = randomElement(savedPitaks);
          const session = pitak.bukid.session;
          // Avoid duplicate (worker, pitak, session)
          const exists = assignments.some(
            (ass) =>
              ass.worker === worker &&
              ass.pitak === pitak &&
              ass.session === session,
          );
          if (exists) continue;
          assignments.push({
            luwangCount: randomDecimal(5, 50, 1),
            assignmentDate: randomDate(
              session.startDate,
              session.endDate || new Date(),
            ),
            status: randomElement(assignmentStatuses),
            notes: `Assignment #${randomInt(1, 999)}`,
            worker,
            pitak,
            session,
          });
        }
      }
      const savedAssignments = await assignmentRepo.save(assignments);
      console.log(`   Created ${savedAssignments.length} assignments`);

      // ------------------------------------------------------------------
      // 6. DEBTS
      // ------------------------------------------------------------------
      console.log("💸 Seeding Debts...");
      const debts = [];
      const debtStatuses = [
        "pending",
        "partially_paid",
        "paid",
        "cancelled",
        "overdue",
        "settled",
      ];
      for (const worker of savedWorkers) {
        const numDebts = randomInt(0, 3);
        for (let d = 0; d < numDebts; d++) {
          const session = randomElement(savedSessions);
          const amount = randomDecimal(500, 20000, 2);
          const interestRate = randomDecimal(0, 12, 1);
          const dueDate = randomDate(
            new Date(),
            new Date(new Date().setMonth(new Date().getMonth() + 6)),
          );
          debts.push({
            originalAmount: amount,
            amount,
            reason: randomElement([
              "Medical",
              "Cash advance",
              "Seed purchase",
              "Fertilizer",
              "Equipment",
              "Emergency",
            ]),
            balance: amount,
            status: randomElement(debtStatuses),
            dateIncurred: randomDate(new Date(2023, 0, 1), new Date()),
            dueDate,
            interestRate,
            totalInterest: 0,
            totalPaid: 0,
            worker,
            session,
          });
        }
      }
      const savedDebts = await debtRepo.save(debts);
      console.log(`   Created ${savedDebts.length} debts`);

      // ------------------------------------------------------------------
      // 7. PAYMENTS
      // ------------------------------------------------------------------
      console.log("💰 Seeding Payments...");
      const payments = [];
      const paymentStatuses = [
        "pending",
        "partially_paid",
        "completed",
        "cancelled",
      ];
      const paymentMethods = [
        "cash",
        "bank_transfer",
        "gcash",
        "salary_deduction",
      ];
      for (const worker of savedWorkers) {
        const numPayments = randomInt(1, 4);
        for (let p = 0; p < numPayments; p++) {
          const pitak = randomElement(savedPitaks);
          const session = pitak.bukid.session;
          const exists = payments.some(
            (pay) =>
              pay.worker === worker &&
              pay.pitak === pitak &&
              pay.session === session,
          );
          if (exists) continue;
          const gross = randomDecimal(3000, 15000, 2);
          const manual = randomDecimal(0, 1000, 2);
          const net = gross - manual;
          payments.push({
            grossPay: gross,
            manualDeduction: manual,
            netPay: net,
            status: randomElement(paymentStatuses),
            paymentDate: randomDate(new Date(2023, 0, 1), new Date()),
            paymentMethod: randomElement(paymentMethods),
            referenceNumber: `PAY-${randomInt(1000, 9999)}`,
            periodStart: randomDate(new Date(2023, 0, 1), new Date()),
            periodEnd: randomDate(new Date(2023, 0, 1), new Date()),
            totalDebtDeduction: randomDecimal(0, 2000, 2),
            otherDeductions: randomDecimal(0, 500, 2),
            notes: `Payment #${p + 1}`,
            worker,
            pitak,
            session,
            assignment:
              randomElement(
                savedAssignments.filter(
                  (a) => a.worker.id === worker.id && a.pitak.id === pitak.id,
                ),
              ) || null,
          });
        }
      }
      const savedPayments = await paymentRepo.save(payments);
      console.log(`   Created ${savedPayments.length} payments`);

      // ------------------------------------------------------------------
      // 8. DEBT HISTORIES (walang payment)
      // ------------------------------------------------------------------
      console.log("📝 Seeding Debt Histories...");
      const debtHistories = [];
      for (const debt of savedDebts) {
        if (debt.status === "paid" || debt.status === "partially_paid") {
          const numPayments = randomInt(1, 3);
          let remaining = debt.amount;
          for (let i = 0; i < numPayments; i++) {
            const amountPaid =
              i === numPayments - 1
                ? remaining
                : randomDecimal(remaining * 0.1, remaining * 0.8, 2);
            if (amountPaid <= 0) break;
            remaining -= amountPaid;
            debtHistories.push({
              amountPaid,
              previousBalance: remaining + amountPaid,
              newBalance: remaining,
              transactionType: "payment",
              paymentMethod: randomElement(paymentMethods),
              notes: `Payment ${i + 1} for debt ${debt.id}`,
              transactionDate: randomDate(
                new Date(debt.dateIncurred),
                new Date(),
              ),
              debt,
              // ❌ Wala nang payment: payment,
            });
          }
        }
      }
      const savedDebtHistories = await debtHistoryRepo.save(debtHistories);
      console.log(`   Created ${savedDebtHistories.length} debt histories`);

      // ------------------------------------------------------------------
      // 9. DEBT PAYMENTS (link payment at debt)
      // ------------------------------------------------------------------
      console.log("🔗 Seeding Debt Payments...");
      const debtPayments = [];
      for (const payment of savedPayments) {
        // Kung may totalDebtDeduction, gumawa ng DebtPayment
        if (payment.totalDebtDeduction > 0) {
          // Humanap ng mga utang ng worker na may balance
          const workerDebts = savedDebts.filter(
            (d) => d.worker.id === payment.worker.id && d.balance > 0,
          );
          if (workerDebts.length === 0) continue;
          // Mag-allocate ng deduction sa mga utang (FIFO)
          let remaining = payment.totalDebtDeduction;
          for (const debt of workerDebts) {
            if (remaining <= 0) break;
            const deductAmount = Math.min(remaining, debt.balance);
            if (deductAmount <= 0) continue;
            const oldBalance = debt.balance;
            // Update debt balance (para sa seed, diretso)
            debt.balance -= deductAmount;
            if (debt.balance === 0) debt.status = "paid";
            else if (debt.status !== "partially_paid") debt.status = "partially_paid";
            // I-save ang debt (kailangan i-update)
            await debtRepo.save(debt);
            // Gumawa ng DebtPayment
            debtPayments.push({
              payment,
              debt,
              amount: deductAmount,
              previousBalance: oldBalance,
              newBalance: debt.balance,
              notes: `Deducted from payment #${payment.id}`,
            });
            remaining -= deductAmount;
          }
        }
      }
      const savedDebtPayments = await debtPaymentRepo.save(debtPayments);
      console.log(`   Created ${savedDebtPayments.length} debt payments`);

      // ------------------------------------------------------------------
      // 10. PAYMENT HISTORIES
      // ------------------------------------------------------------------
      console.log("📊 Seeding Payment Histories...");
      const paymentHistories = [];
      for (const payment of savedPayments) {
        const numEntries = randomInt(1, 3);
        for (let i = 0; i < numEntries; i++) {
          paymentHistories.push({
            actionType: randomElement([
              "create",
              "update",
              "status_change",
              "adjustment",
            ]),
            changedField: randomElement([
              "grossPay",
              "netPay",
              "status",
              "manualDeduction",
            ]),
            oldValue: null,
            newValue: i === 0 ? "created" : "updated",
            oldAmount: i === 0 ? 0 : payment.grossPay - randomInt(100, 500),
            newAmount: payment.grossPay,
            notes: `History entry ${i + 1}`,
            performedBy: randomElement(["system", "admin", "manager"]),
            // @ts-ignore
            changeDate: randomDate(new Date(payment.createdAt), new Date()),
            payment,
          });
        }
      }
      const savedPaymentHistories =
        await paymentHistoryRepo.save(paymentHistories);
      console.log(
        `   Created ${savedPaymentHistories.length} payment histories`,
      );

      // ------------------------------------------------------------------
      // 11. SYSTEM SETTINGS – CLEAR OLD ONES FIRST
      // ------------------------------------------------------------------
      console.log("⚙️ Seeding System Settings...");
      await systemSettingRepo.clear();
      console.log("   Cleared existing system settings");

      const activeSession =
        savedSessions.find((s) => s.status === "active") || savedSessions[4];
      const settings = [
        {
          key: "company_name",
          value: "Kabisilya Farm",
          setting_type: SettingType.GENERAL,
          description: "Farm name",
          is_public: true,
          is_deleted: false,
        },
        {
          key: "default_currency",
          value: "PHP",
          setting_type: SettingType.GENERAL,
          description: "Currency",
          is_public: true,
        },
        {
          key: "default_session_id",
          value: String(activeSession.id),
          setting_type: SettingType.FARM_SESSION,
          description: "Current session",
          is_public: false,
        },
        {
          key: "require_default_session",
          value: "true",
          setting_type: SettingType.FARM_SESSION,
          is_public: false,
        },
        {
          key: "rate_per_luwang",
          value: "250",
          setting_type: SettingType.FARM_PAYMENT,
          description: "Rate per luwang",
        },
        {
          key: "debt_allocation_strategy",
          value: "auto",
          setting_type: SettingType.FARM_DEBT,
        },
        {
          key: "enable_cash_drawer",
          value: "false",
          setting_type: SettingType.GENERAL,
        },
      ];
      await systemSettingRepo.save(settings);
      console.log("   System settings seeded");

      await queryRunner.commitTransaction();
      console.log("✅ Database seeding completed successfully!");

      console.log("\n📊 FINAL SUMMARY:");
      console.log(`   Sessions: ${savedSessions.length}`);
      console.log(`   Bukids: ${savedBukids.length}`);
      console.log(`   Pitaks: ${savedPitaks.length}`);
      console.log(`   Workers: ${savedWorkers.length}`);
      console.log(`   Assignments: ${savedAssignments.length}`);
      console.log(`   Debts: ${savedDebts.length}`);
      console.log(`   Debt Histories: ${savedDebtHistories.length}`);
      console.log(`   Debt Payments: ${savedDebtPayments.length}`);
      console.log(`   Payments: ${savedPayments.length}`);
      console.log(`   Payment Histories: ${savedPaymentHistories.length}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await seedDataSource.query("PRAGMA foreign_keys = ON");
    await seedDataSource.destroy();
    console.log("✅ Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    if (seedDataSource && seedDataSource.isInitialized)
      await seedDataSource.destroy().catch(() => {});
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
      fs.unlinkSync(dbPath);
      console.log("✅ Database file deleted");
    }
    const journalFiles = [
      `${dbPath}-journal`,
      `${dbPath}-wal`,
      `${dbPath}-shm`,
    ];
    journalFiles.forEach((file) => {
      if (fs.existsSync(file))
        try {
          fs.unlinkSync(file);
        } catch {}
    });
    console.log("✅ Database reset complete");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData };