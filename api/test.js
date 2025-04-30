import jwt from "jsonwebtoken";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2YwMmNkMjc1ODE4NWFkYmY0YmMwNmYiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTc0NTk5MzI4MCwiZXhwIjoxNzQ1OTk2ODgwfQ.TtoC0ayNf7jDRnRlildZbBKhCDSPHIuSW7ZJk0bGc7w";
const decoded = jwt.verify(token, "WW]LlR[fG]YZaoptZL[cW238EH05FJln-GXbE@");
console.log("Decoded token:", decoded);
