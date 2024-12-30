const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

// 登入嘗試管理器
class LoginAttemptManager {
  constructor() {
    this.attempts = new Map();
    // 每小時清理過期記錄
    this.cleanupInterval = setInterval(() => this.cleanup(), 1000 * 60 * 60);
  }
  // 獲取登入嘗試資訊
  getAttemptInfo(ip, phone) {
    const key = `${ip}:${phone}`;
    const now = dayjs();
    const attempt = this.attempts.get(key) || {
      count: 0,
      lockUntil: null,
      firstAttempt: now
    };

    // 檢查是否過期或已解鎖
    if (
      now.diff(attempt.firstAttempt, 'hour') >= 24 ||
      (attempt.lockUntil && now.isAfter(attempt.lockUntil))
    ) {
      this.attempts.delete(key);
      return {
        count: 0,
        lockUntil: null,
        firstAttempt: now
      };
    }

    return attempt;
  }

  // 檢查帳號是否被鎖定
  isLocked(ip, phone) {
    const attempt = this.getAttemptInfo(ip, phone);
    return !!(attempt.lockUntil && dayjs().isBefore(attempt.lockUntil));
  }

  // 記錄失敗的登入嘗試
  // 總共允許 5 次嘗試
  // 第 3 次失敗: 鎖定 2 分鐘
  // 第 4 次失敗: 鎖定 5 分鐘
  // 第 5 次失敗: 直接鎖定 30 分鐘
  recordFailedAttempt(ip, phone) {
    const key = `${ip}:${phone}`;
    const attempt = this.getAttemptInfo(ip, phone);
    const now = dayjs();

    attempt.count++;

    if (attempt.count >= 5) {
      attempt.lockUntil = now.add(30, 'minutes');
    } else if (attempt.count >= 3) {
      const lockMinutes = attempt.count === 3 ? 2 : 5;
      attempt.lockUntil = now.add(lockMinutes, 'minutes');
    }

    this.attempts.set(key, attempt);

    return {
      remainingAttempts: Math.max(0, 5 - attempt.count),
      lockMinutes: attempt.lockUntil ? Math.max(0, attempt.lockUntil.diff(now, 'minute')) : 0
    };
  }

  // 重置登入嘗試記錄
  reset(ip, phone) {
    const key = `${ip}:${phone}`;
    this.attempts.delete(key);
  }

  // 清理過期的登入嘗試記錄
  cleanup() {
    const now = dayjs();
    for (const [key, attempt] of this.attempts.entries()) {
      // 移除超過24小時的記錄和已解鎖的記錄
      if (
        now.diff(attempt.firstAttempt, 'hour') >= 24 ||
        (attempt.lockUntil && now.isAfter(attempt.lockUntil))
      ) {
        this.attempts.delete(key);
      }
    }
  }
}

module.exports = new LoginAttemptManager();
