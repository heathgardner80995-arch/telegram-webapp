function luhnCheck(number) {
  const digits = number.replace(/\s/g, "");
  if (!/^\d{16,19}$/.test(digits)) return false;

  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function isSberbankCard(number) {
  const digits = number.replace(/\s/g, "");
  if (digits.length < 6) return false;
  const bin = parseInt(digits.substring(0, 6), 10);

  // Visa
  if (bin === 427601 || bin === 427604 || bin === 427644) return true;
  if (bin === 427901) return true;
  if (bin >= 462729 && bin <= 462750) return true;

  // Mastercard
  if (bin >= 513690 && bin <= 513699) return true;
  if (bin >= 546907 && bin <= 546922) return true;

  // МИР
  if (bin >= 220000 && bin <= 220019) return true;
  if (bin === 220022) return true;

  return false;
}

function isValidCard(number) {
  return luhnCheck(number) && isSberbankCard(number);
}

module.exports = { luhnCheck, isSberbankCard, isValidCard };
