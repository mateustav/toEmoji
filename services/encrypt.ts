import crypto from "crypto";

interface EncryptedData {
  iv: string;
  content: string;
  tag: string;
}

const algorithm = "aes-256-gcm";
if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

const key = Buffer.from(process.env.ENCRYPTION_KEY, "base64");

function encrypt(text: string): EncryptedData {
  const iv = crypto.randomBytes(12).toString("base64");
  const cipher = crypto.createCipheriv(
    algorithm,
    key,
    Buffer.from(iv, "base64")
  );

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    content: encrypted.toString("base64"),
    iv,
    tag: tag.toString("base64"),
  };
}

function decrypt(iv: string, content: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(content, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export { encrypt, decrypt };
