const otpStore = new Map()

export function saveOtp(phone, otp) {
  otpStore.set(phone, {
    otp,
    createdAt: Date.now(),
  })
}

export function verifyOtp(phone, otp) {
  const storedOtp = otpStore.get(phone)

  if (!storedOtp) {
    return false
  }

  const isExpired = Date.now() - storedOtp.createdAt > 5 * 60 * 1000
  if (isExpired) {
    otpStore.delete(phone)
    return false
  }

  if (storedOtp.otp !== otp) {
    return false
  }

  otpStore.delete(phone)
  return true
}
