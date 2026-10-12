export const capitalize = (str) => {
  if (!str) return ""; // Handle null, undefined, or empty strings safely
  return str.charAt(0).toUpperCase() + str.slice(1);
};
