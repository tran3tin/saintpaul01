const validator = require("validator");

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i;
const PHONE_REGEX = /^[+]?\d{7,15}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const isValidEmail = (email = "") => EMAIL_REGEX.test(String(email).trim());

const isValidPhone = (phone = "") => PHONE_REGEX.test(String(phone).trim());

const isStrongPassword = (password = "") => PASSWORD_REGEX.test(password);

const sanitizeInput = (input = "") => validator.escape(String(input));

const isValidEnum = (value, enumArray = []) =>
  Array.isArray(enumArray) && enumArray.includes(value);

module.exports = {
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  sanitizeInput,
  isValidEnum,
};
