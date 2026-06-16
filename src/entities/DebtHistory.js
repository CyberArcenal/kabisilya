// src/entities/DebtHistory.js
const { EntitySchema } = require("typeorm");

const DebtHistory = new EntitySchema({
  name: "DebtHistory",
  tableName: "debt_histories",
  columns: {
    id: { type: Number, primary: true, generated: true },
    // Amount paid in this transaction
    amountPaid: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0.0,
    },
    // Previous balance before this payment
    previousBalance: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0.0,
    },
    // New balance after this payment
    newBalance: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0.0,
    },
    // Type: "payment", "adjustment", "interest", "refund"
    transactionType: {
      type: String,
      default: "payment",
    },
    performedBy: {
      type: String,
      nullable: true,
    },
    paymentMethod: { type: String, nullable: true },
    referenceNumber: { type: String, nullable: true },
    notes: { type: String, nullable: true },
    transactionDate: { type: Date, createDate: true },
    createdAt: { type: Date, createDate: true },
    deletedAt: { type: Date, nullable: true },
  },
  relations: {
    debt: {
      target: "Debt",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "history",
      onDelete: "CASCADE",
    },
  },
  indices: [
    {
      name: "IDX_DEBT_HISTORY_DATE",
      columns: ["transactionDate"],
    },
    {
      name: "IDX_DEBT_HISTORY_TYPE",
      columns: ["transactionType"],
    },
  ],
});

module.exports = DebtHistory;
