export const handlePhoneChange = (e, setPhone) => {
  let value = e.target.value;

  // Only allow numbers and +
  value = value.replace(/[^0-9+]/g, "");

  // Allow + only at the beginning
  if (value.includes("+")) {
    value =
      value[0] === "+"
        ? "+" + value.slice(1).replace(/\+/g, "")
        : value.replace(/\+/g, "");
  }

  // Set maximum length based on format
  let maxChars = 11;

  if (value.startsWith("+63")) {
    maxChars = 13;
  } else if (value.startsWith("63")) {
    maxChars = 12;
  }

  // Limit length
  value = value.slice(0, maxChars);

  setPhone(value);
};
