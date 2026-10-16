/**
 * FoodSafe365 — Server-Side Binary Magic-Byte & Malware Detection
 * P0-6 Hardening: Rejects unsupported formats, disguised executables, HTML polyglots, and unsafe PDF streams.
 */

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

export interface FileDetectionResult {
  mime: 'image/jpeg' | 'image/png' | 'application/pdf';
  extension: 'jpg' | 'png' | 'pdf';
  confidence: number;
}

export interface SecurityInspectionResult {
  safe: boolean;
  detectedType?: FileDetectionResult;
  reason?: string;
  violations: string[];
}

// Byte signatures
const JPEG_HEADER = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PDF_HEADER = Buffer.from('%PDF');

// Dangerous binary executable headers
const MZ_HEADER = Buffer.from([0x4d, 0x5a]); // Windows PE/EXE/DLL
const ELF_HEADER = Buffer.from([0x7f, 0x45, 0x4c, 0x46]); // Linux ELF
const MACH_O_32 = Buffer.from([0xfe, 0xed, 0xfa, 0xce]); // Mach-O 32-bit
const MACH_O_64 = Buffer.from([0xfe, 0xed, 0xfa, 0xcf]); // Mach-O 64-bit
const MACH_O_CIGAM_32 = Buffer.from([0xce, 0xfa, 0xed, 0xfe]); // Mach-O 32-bit reverse
const MACH_O_CIGAM_64 = Buffer.from([0xcf, 0xfa, 0xed, 0xfe]); // Mach-O 64-bit reverse
const MACH_O_FAT = Buffer.from([0xca, 0xfe, 0xba, 0xbe]); // Mach-O Universal/Fat or Java Class
const SHEBANG_HEADER = Buffer.from([0x23, 0x21]); // #! script header

// Dangerous text/script patterns in byte buffers
const DANGEROUS_TEXT_PATTERNS = [
  /<script[\s>]/i,
  /<\/script>/i,
  /<html[\s>]/i,
  /<iframe[\s>]/i,
  /<embed[\s>]/i,
  /<object[\s>]/i,
  /<svg[\s>]/i,
  /onload\s*=/i,
  /onerror\s*=/i,
  /javascript:/i,
  /<\?php/i,
  /<%[\s=]/i
];

// Dangerous PDF active execution tokens
const PDF_ACTIVE_EXPLOIT_TOKENS = [
  /\/JavaScript\b/i,
  /\/JS\b/i,
  /\/Launch\b/i,
  /\/EmbeddedFiles\b/i
];

/**
 * Detects the MIME type of a file buffer based on leading magic bytes.
 */
export function detectMagicBytes(buffer: Buffer): FileDetectionResult | null {
  if (!buffer || buffer.length < 4) return null;

  // 1. Check JPEG
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(JPEG_HEADER)) {
    return { mime: 'image/jpeg', extension: 'jpg', confidence: 1.0 };
  }

  // 2. Check PNG
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_HEADER)) {
    return { mime: 'image/png', extension: 'png', confidence: 1.0 };
  }

  // 3. Check PDF
  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(PDF_HEADER)) {
    return { mime: 'application/pdf', extension: 'pdf', confidence: 1.0 };
  }

  return null;
}

/**
 * Checks for known executable headers at the beginning of the buffer.
 */
export function containsExecutableHeader(buffer: Buffer): { hasExecutableHeader: boolean; headerType?: string } {
  if (!buffer || buffer.length < 2) return { hasExecutableHeader: false };

  if (buffer.subarray(0, 2).equals(MZ_HEADER)) {
    return { hasExecutableHeader: true, headerType: 'Windows Portable Executable (MZ / PE / DLL)' };
  }
  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(ELF_HEADER)) {
    return { hasExecutableHeader: true, headerType: 'Linux Executable and Linkable Format (ELF)' };
  }
  if (buffer.length >= 4) {
    const head4 = buffer.subarray(0, 4);
    if (
      head4.equals(MACH_O_32) ||
      head4.equals(MACH_O_64) ||
      head4.equals(MACH_O_CIGAM_32) ||
      head4.equals(MACH_O_CIGAM_64) ||
      head4.equals(MACH_O_FAT)
    ) {
      return { hasExecutableHeader: true, headerType: 'macOS Mach-O Binary' };
    }
  }
  if (buffer.subarray(0, 2).equals(SHEBANG_HEADER)) {
    return { hasExecutableHeader: true, headerType: 'Shell Script (#!)' };
  }

  return { hasExecutableHeader: false };
}

/**
 * Performs deep security inspection of buffer content:
 * - Checks size bounds
 * - Detects true magic bytes
 * - Flags executable headers
 * - Scans for script/HTML polyglots disguised as images
 * - Scans PDF stream for active script execution tokens
 */
export function inspectBinaryContent(
  buffer: Buffer,
  declaredMime?: string,
  declaredSize?: number
): SecurityInspectionResult {
  const violations: string[] = [];

  // 1. Size bounds
  if (!buffer || buffer.length === 0) {
    violations.push('File buffer is empty (0 bytes).');
    return { safe: false, violations, reason: 'EMPTY_FILE' };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    violations.push(`File exceeds maximum allowed size of ${MAX_FILE_SIZE_BYTES} bytes (actual: ${buffer.length}).`);
  }

  if (declaredSize !== undefined && declaredSize !== buffer.length) {
    violations.push(`File size mismatch: declared ${declaredSize} bytes, but actual buffer is ${buffer.length} bytes.`);
  }

  // 2. Executable header check
  const exeCheck = containsExecutableHeader(buffer);
  if (exeCheck.hasExecutableHeader) {
    violations.push(`Disguised executable content detected: ${exeCheck.headerType}.`);
  }

  // 3. Magic-byte detection
  const detected = detectMagicBytes(buffer);
  if (!detected) {
    violations.push('Unsupported or unrecognized file format. Only JPEG, PNG, and PDF files are allowed.');
  } else if (declaredMime && declaredMime.toLowerCase().trim() !== detected.mime) {
    violations.push(`MIME mismatch: declared "${declaredMime}", but binary signature matches "${detected.mime}".`);
  }

  // 4. Disguised HTML / Script polyglot check (inspect up to first 4KB)
  const sampleLength = Math.min(buffer.length, 4096);
  const sampleString = buffer.subarray(0, sampleLength).toString('utf8');

  for (const pattern of DANGEROUS_TEXT_PATTERNS) {
    if (pattern.test(sampleString)) {
      violations.push(`Disguised script or HTML content detected in file body: pattern "${pattern}".`);
      break;
    }
  }

  // 5. PDF active script execution tokens
  if (detected?.mime === 'application/pdf') {
    const pdfContent = buffer.toString('binary');
    for (const token of PDF_ACTIVE_EXPLOIT_TOKENS) {
      if (token.test(pdfContent)) {
        violations.push(`PDF contains dangerous active executable token: "${token}".`);
        break;
      }
    }
  }

  const safe = violations.length === 0;
  return {
    safe,
    detectedType: detected || undefined,
    violations,
    reason: safe ? undefined : violations[0]
  };
}
