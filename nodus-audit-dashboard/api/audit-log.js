import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// try S3 upload if env present
async function uploadToS3(body) {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } = process.env;
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET) return null;
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
  });
  const key = `audit-${Date.now()}.json`;
  const cmd = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: JSON.stringify(body, null, 2),
    ContentType: "application/json"
  });
  await s3.send(cmd);
  return key;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body || (await new Promise(r => {
      let s = "";
      req.on("data", c => s += c);
      req.on("end", () => r(JSON.parse(s)));
    }));

    const apiKey = process.env.AUDIT_API_KEY;
    const clientKey = req.headers["x-audit-key"] || req.query.key;
    if (apiKey && clientKey !== apiKey) {
      return res.status(401).json({ error: "Invalid audit key" });
    }

    try {
      const s3Key = await uploadToS3(body);
      if (s3Key) {
        return res.status(200).json({ message: "Uploaded to S3", key: s3Key });
      }
    } catch (err) {
      console.error("S3 upload failed:", err && err.message);
    }

    const logsDir = path.join(__dirname, "..", "logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const filePath = path.join(logsDir, `audit_${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8");

    return res.status(200).json({ message: "Saved locally", file: filePath });
  } catch (err) {
    console.error("audit-log error", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
