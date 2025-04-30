export default function handler(req, res) {
  console.log("Basic test route hit!");
  res.status(200).json({ message: "Basic test route works!" });
}
