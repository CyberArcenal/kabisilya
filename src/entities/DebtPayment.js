const { EntitySchema } = require("typeorm");

const DebtPayment = new EntitySchema({
  name: "DebtPayment",
  tableName: "debt_payments",
  columns: {
    id: { type: Number, primary: true, generated: true },
    amount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0.0,
    },
    previousBalance: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0.0,
    },
    newBalance: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0.0,
    },
    notes: { type: String, nullable: true },
    createdAt: { type: Date, createDate: true },
    deletedAt: { type: Date, nullable: true },
  },
  relations: {
    payment: {
      target: "Payment",
      type: "many-to-one",
      joinColumn: { name: "paymentId" },
      inverseSide: "debtPayments",
      onDelete: "CASCADE",
    },
    debt: {
      target: "Debt",
      type: "many-to-one",
      joinColumn: { name: "debtId" },
      inverseSide: "debtPayments",
      onDelete: "CASCADE",
    },
  },
  indices: [
    {
      name: "IDX_DEBT_PAYMENT_PAYMENT",
      columns: ["payment"], // ✅ property name, NOT "paymentId"
    },
    {
      name: "IDX_DEBT_PAYMENT_DEBT",
      columns: ["debt"], // ✅ property name, NOT "debtId"
    },
    {
      name: "IDX_DEBT_PAYMENT_CREATED",
      columns: ["createdAt"],
    },
  ],
  uniques: [
    {
      name: "UQ_DEBT_PAYMENT_PAYMENT_DEBT",
      columns: ["payment", "debt"], // ✅ property names
    },
  ],
});

module.exports = DebtPayment;