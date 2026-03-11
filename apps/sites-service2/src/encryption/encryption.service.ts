import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly logger = new Logger(EncryptionService.name);
  private encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  onModuleInit() {
    const masterKey = process.env.ENCRYPTION_MASTER_KEY || process.env.ENCRYPTION_KEY || 'default-key-change-in-production!!';
    const salt = process.env.ENCRYPTION_SALT || 'flexee-default-salt';
    this.encryptionKey = scryptSync(masterKey, salt, 32) as Buffer;
    this.logger.log('EncryptionService initialized (AES-256-GCM)');
  }

  encrypt(plaintext: string): string {
    if (!plaintext) return plaintext;
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, this.encryptionKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);
    return combined.toString('base64');
  }

  decrypt(encryptedData: string): string {
    if (!encryptedData) return encryptedData;
    const combined = Buffer.from(encryptedData, 'base64');
    const iv = combined.subarray(0, this.ivLength);
    const authTag = combined.subarray(this.ivLength, this.ivLength + this.tagLength);
    const ciphertext = combined.subarray(this.ivLength + this.tagLength);
    const decipher = createDecipheriv(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
