import * as crypto from "crypto";
import { NoelDataDto } from "src/components/noel/dto/noel-data.dto";
import { EndGamePayloadDto } from "src/components/noel/dto/noel-encryption.dto";

function arrayBufferToBase64(arraybuffer: ArrayBuffer) {
  const buffer = Buffer.from(arraybuffer);
  return buffer.toString("base64");
}

function base64ToArrayBuffer(base64: string) {
  return Buffer.from(base64, "base64");
}

// Hybrid encryption: AES for data, RSA for AES key
// This approach solves the RSA encryption size limitation by:
// 1. Using AES-GCM to encrypt the actual data (no size limit)
// 2. Using RSA-OAEP to encrypt only the AES key (small, fixed size)
// 3. Sending both encrypted AES key and encrypted data to client
export const encryptWithPublicKey = async (
  publicKeyB64: string,
  data: NoelDataDto,
) => {
  // 1) Import the public key
  const publicKeyBuffer = base64ToArrayBuffer(publicKeyB64);
  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  );

  // 2) Generate a random AES key for data encryption
  const aesKey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt"],
  );

  // 3) Convert data to JSON string and encode
  const jsonStr = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonStr);

  // 4) Generate random IV for AES-GCM
  const iv = new Uint8Array(crypto.randomBytes(12));

  // 5) Encrypt the data with AES
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    dataBuffer,
  );

  // 6) Export the AES key
  const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey);

  // 7) Encrypt the AES key with RSA
  const encryptedAesKey = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    exportedAesKey,
  );

  // 8) Return combined encrypted data (AES key + IV + encrypted data)
  const result = {
    encryptedKey: arrayBufferToBase64(encryptedAesKey),
    iv: arrayBufferToBase64(iv.buffer),
    encryptedData: arrayBufferToBase64(encryptedData),
  };

  return JSON.stringify(result);
};

// Verify signature with public key (anyone can verify)
export const verifyWithPublicKey = async (
  publicKeyB64: string,
  data: EndGamePayloadDto,
  signature: string,
) => {
  // 1) Import the public key
  const publicKeyBuffer = base64ToArrayBuffer(publicKeyB64);
  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"],
  );

  // 2) Convert data to JSON string and encode
  const jsonStr = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonStr);

  // 3) Convert signature back to buffer
  const signatureBuffer = base64ToArrayBuffer(signature);

  // 4) Verify the signature
  return await crypto.subtle.verify(
    {
      name: "RSASSA-PKCS1-v1_5",
    },
    publicKey,
    signatureBuffer,
    dataBuffer,
  );
};
