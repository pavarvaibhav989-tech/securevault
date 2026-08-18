/**
 * CAPTCHA Utility
 * Generates text and math CAPTCHAs for bot prevention.
 */

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

const generateTextCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let text = '';
  for (let i = 0; i < 6; i++) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }
  return { text, answer: text };
};

const generateMathCaptcha = () => {
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;

  if (op === '+') {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 20) + 10;
    b = Math.floor(Math.random() * 10) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 9) + 2;
    answer = a * b;
  }

  return {
    question: `${a} ${op} ${b} = ?`,
    answer: String(answer),
  };
};

const verifyCaptcha = (userAnswer, correctAnswer) => {
  return String(userAnswer).trim().toUpperCase() === String(correctAnswer).trim().toUpperCase();
};

module.exports = { generateOTP, generateTextCaptcha, generateMathCaptcha, verifyCaptcha };
