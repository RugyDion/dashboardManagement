const mongoose = require("mongoose");

// Three Schema's because your design doesn't calculate dynamically and requires user input for all actions ❌❌
const SalesReportSchema = new mongoose.Schema({
  bookingsEndOfDaySales: {
    type: Number,
    required: [true, "This field is required"],
    min: [0, "Field cannot have a negative value"],
  },
  foodEndOfDaySales: {
    type: Number,
    required: [true, "This field is required"],
    min: [0, "Field cannot have a negative value"],
  },
  drinksEndOfDaySales: { 
    type: Number,
    required: [true, "This field is necessary"],
    min: [0, "Field cannot have a negative value"],
  },
  eventsEndOfDaySales: {
    type: Number,
    required: [true, "This field is necessary"],
    min: [0, "Field cannot have a negative value"],
  },
  laundryEndOfDaySales: {
    type: Number,
    required: [true, "This field is necessary"],
    min: [0, "Field cannot have a negative value"],
  },
  poolEndOfDaySales: {
    type: Number,
    required: [true, "This field is necessary"],
    min: [0, "Field cannot have a negative value"],
  },
  totalSales:{
    type:Number,
    required: [true, "This field is necessary"],
    min: [0, "Field cannot have a negative value"],
  },
  date:{
  type: Date,
  default: Date.now
}
});

const DailyStorageSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, "Please provide name of product"],
  },
  quantity: {
    type: Number,
    required: [true, "Please provide quantity of the product"],
    min: [0, "Cannot be a negative value"],
  },
  amountPerUnit: {
    type: Number,
    required: [true, "Please provide amount per unit"],
    min: [0, "Cannot be negative"],
  },
  totalAmount: {
    type: Number,
    required: [true, "Please provide total amount"],
    min: [0, "Cannot be negative"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const StorageUsageSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, "Please provide name of product"],
  },
  takeOutQuantity: {
    type: Number,
    required: [true, "Please provide the quantity to be taken out"],
    min: [0, "Cannot be a negative value"],
  },
  date:{
  type: Date,
  default: Date.now
}
});


const debtSchema = new mongoose.Schema({
    recordedBy: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: "Debt entry"
    },
    totalAmount: {
        type: Number,
        required: true
    },
    remainingAmount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});


const PayrollSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
  },
  staff: [
    {
      staffName: { type: String, required: true },
      designation: { type: String, required: true },
      grossSalary: { type: Number, required: true },
      bonus: { type: Number, default: 0 },
      tips: { type: Number, default: 0 },
      debt: { type: Number, default: 0 },
      shortage: { type: Number, default: 0 },
      payable: { type: Number, required: true },
      accountNumber: { type: String },
      bankName: { type: String },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



const SalesReport = mongoose.model("SalesReport", SalesReportSchema);
const DailyStorage = mongoose.model("DailyStorage", DailyStorageSchema);
const StorageUsage = mongoose.model("StorageUsage", StorageUsageSchema);
const Debt = mongoose.model("Debt", debtSchema);
const Payroll = mongoose.model("Payroll", PayrollSchema);

module.exports = { 
  SalesReport, 
  DailyStorage, 
  StorageUsage,
  Debt,
  Payroll
};
