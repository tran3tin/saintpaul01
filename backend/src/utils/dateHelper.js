const DAY_IN_MS = 24 * 60 * 60 * 1000;

const normalizeDate = (dateInput) => {
  if (!dateInput) {
    return null;
  }

  const date =
    dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
  return Number.isNaN(date.getTime()) ? null : date;
};

const calculateAge = (dateOfBirth) => {
  const dob = normalizeDate(dateOfBirth);
  if (!dob) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
};

const formatDate = (dateInput, format = "YYYY-MM-DD") => {
  const date = normalizeDate(dateInput);
  if (!date) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (format) {
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM-DD-YYYY":
      return `${month}-${day}-${year}`;
    default:
      return date.toISOString();
  }
};

const isValidDate = (dateString) => !!normalizeDate(dateString);

const AGE_RANGES = [
  { label: "<30", min: 0, max: 29 },
  { label: "30-40", min: 30, max: 40 },
  { label: "40-50", min: 41, max: 50 },
  { label: "50-60", min: 51, max: 60 },
  { label: "60-70", min: 61, max: 70 },
  { label: ">70", min: 71, max: Infinity },
];

const getAgeRange = (age) => {
  if (age === null || age === undefined || Number.isNaN(Number(age))) {
    return "unknown";
  }

  const numericAge = Number(age);
  const matched = AGE_RANGES.find(
    (range) => numericAge >= range.min && numericAge <= range.max
  );

  return matched ? matched.label : "unknown";
};

const getCurrentYear = () => new Date().getFullYear();

const getYearFromDate = (dateInput) => {
  const date = normalizeDate(dateInput);
  return date ? date.getFullYear() : null;
};

module.exports = {
  calculateAge,
  formatDate,
  isValidDate,
  getAgeRange,
  getCurrentYear,
  getYearFromDate,
};
