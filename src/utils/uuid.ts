/**
 * UUID 生成工具函数
 */

/**
 * 生成 UUID v4
 * @returns UUID v4 字符串
 */
export function generateUUID(): string {
  // 使用 crypto.randomUUID() 如果可用（现代浏览器）
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // 备用方案：使用 Math.random()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 生成短 UUID（8位）
 * @returns 8位随机字符串
 */
export function generateShortUUID(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * 生成课程ID
 * @param prefix - 前缀，默认为 'course'
 * @returns 带前缀的课程ID
 */
export function generateCourseId(prefix: string = 'course'): string {
  const shortId = generateShortUUID();
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}_${shortId}`;
}

/**
 * 生成交易ID
 * @param prefix - 前缀，默认为 'tx'
 * @returns 带前缀的交易ID
 */
export function generateTransactionId(prefix: string = 'tx'): string {
  const shortId = generateShortUUID();
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}_${shortId}`;
}

/**
 * 验证 UUID 格式
 * @param uuid - 要验证的 UUID 字符串
 * @returns 是否为有效的 UUID 格式
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * 生成随机字符串
 * @param length - 字符串长度
 * @param chars - 可用字符集，默认为字母数字
 * @returns 随机字符串
 */
export function generateRandomString(
  length: number = 8, 
  chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
