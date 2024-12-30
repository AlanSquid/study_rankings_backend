const { expect } = require('chai');
const sinon = require('sinon');
const dayjs = require('dayjs');
const LoginAttemptManager = require('../../lib/login-attempt');

describe('LoginAttemptManager', () => {
  let clock;

  beforeEach(() => {
    // Use fake timers
    clock = sinon.useFakeTimers({
      now: new Date('2024-01-01T00:00:00Z'),
      shouldAdvanceTime: true
    });
  });

  afterEach(() => {
    clock.restore();
    LoginAttemptManager.attempts.clear();
  });

  describe('getAttemptInfo', () => {
    it('應該返回新的嘗試資訊當key不存在時', () => {
      const info = LoginAttemptManager.getAttemptInfo('127.0.0.1', '0912345678');
      expect(info.count).to.equal(0);
      expect(info.lockUntil).to.be.null;
      expect(info.firstAttempt).to.exist;
    });

    it('應該重置過期的嘗試記錄（24小時後）', () => {
      const ip = '127.0.0.1';
      const phone = '0912345678';

      // 設置初始嘗試
      LoginAttemptManager.recordFailedAttempt(ip, phone);

      // 前進25小時
      clock.tick(25 * 60 * 60 * 1000);

      const info = LoginAttemptManager.getAttemptInfo(ip, phone);
      expect(info.count).to.equal(0);
    });
  });

  describe('isLocked', () => {
    it('應該在未鎖定時返回false', () => {
      expect(LoginAttemptManager.isLocked('127.0.0.1', '0912345678')).to.be.false;
    });

    it('應該在鎖定期間返回true', () => {
      const ip = '127.0.0.1';
      const phone = '0912345678';

      // 觸發鎖定（5次失敗）
      for (let i = 0; i < 5; i++) {
        LoginAttemptManager.recordFailedAttempt(ip, phone);
      }

      expect(LoginAttemptManager.isLocked(ip, phone)).to.be.true;

      // 前進31分鐘
      clock.tick(31 * 60 * 1000);
      expect(LoginAttemptManager.isLocked(ip, phone)).to.be.false;
    });
  });

  describe('recordFailedAttempt', () => {
    it('應該正確追踪失敗次數', () => {
      const ip = '127.0.0.1';
      const phone = '0912345678';

      let result = LoginAttemptManager.recordFailedAttempt(ip, phone);
      expect(result.remainingAttempts).to.equal(4);

      result = LoginAttemptManager.recordFailedAttempt(ip, phone);
      expect(result.remainingAttempts).to.equal(3);
    });

    it('應該在第3次失敗時鎖定2分鐘', () => {
      const ip = '127.0.0.1';
      const phone = '0912345678';

      for (let i = 0; i < 3; i++) {
        LoginAttemptManager.recordFailedAttempt(ip, phone);
      }

      const info = LoginAttemptManager.getAttemptInfo(ip, phone);
      expect(info.lockUntil.diff(dayjs(), 'minute')).to.equal(2);
    });

    it('應該在第5次失敗時鎖定30分鐘', () => {
      const ip = '127.0.0.1';
      const phone = '0912345678';

      for (let i = 0; i < 5; i++) {
        LoginAttemptManager.recordFailedAttempt(ip, phone);
      }

      const info = LoginAttemptManager.getAttemptInfo(ip, phone);
      expect(info.lockUntil.diff(dayjs(), 'minute')).to.equal(30);
    });
  });

  describe('reset', () => {
    it('應該清除指定IP和電話的嘗試記錄', () => {
      const ip = '127.0.0.1';
      const phone = '0912345678';

      LoginAttemptManager.recordFailedAttempt(ip, phone);
      LoginAttemptManager.reset(ip, phone);

      const info = LoginAttemptManager.getAttemptInfo(ip, phone);
      expect(info.count).to.equal(0);
    });
  });

  describe('cleanup', () => {
    it('應該清除過期的記錄', () => {
      const ip = '127.0.0.1';
      const phone = '0912345678';

      LoginAttemptManager.recordFailedAttempt(ip, phone);

      // 前進25小時
      clock.tick(25 * 60 * 60 * 1000);

      LoginAttemptManager.cleanup();

      const info = LoginAttemptManager.getAttemptInfo(ip, phone);
      expect(info.count).to.equal(0);
    });

    it('應該清除已解鎖的記錄', () => {
      const ip = '127.0.0.1';
      const phone = '0912345678';

      // 觸發鎖定
      for (let i = 0; i < 5; i++) {
        LoginAttemptManager.recordFailedAttempt(ip, phone);
      }

      // 前進31分鐘
      clock.tick(31 * 60 * 1000);

      LoginAttemptManager.cleanup();

      const info = LoginAttemptManager.getAttemptInfo(ip, phone);
      expect(info.count).to.equal(0);
    });
  });
});
