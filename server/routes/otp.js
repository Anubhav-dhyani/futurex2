import axios from 'axios'
import express from 'express'
import { saveOtp, verifyOtp } from '../utils/otpStore.js'

const router = express.Router()

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function getMsg91FlowId() {
  return process.env.MSG91_FLOW_ID || process.env.SMS_TEMPLATE_ID
}

router.post('/send', async (request, response) => {
  const { mobile, countryCode } = request.body

  if (!mobile || !countryCode) {
    return response.status(400).json({ message: 'Mobile and country code are required.' })
  }

  const otp = generateOtp()
  const fullPhone = `${countryCode}${mobile}`

  try {
    if (process.env.MSG91_AUTH_KEY && getMsg91FlowId()) {
      console.log('MSG91_FLOW_ID:', getMsg91FlowId())

      const msg91Response = await axios.post(
        'https://control.msg91.com/api/v5/flow',
        {
          flow_id: getMsg91FlowId(),
          recipients: [
            {
              mobiles: fullPhone.replace('+', ''),
              OTP: otp,
              Validity: '5',
            },
          ],
        },
        {
          headers: {
            accept: 'application/json',
            authkey: process.env.MSG91_AUTH_KEY,
            'Content-Type': 'application/json',
          },
        },
      )

      console.log('MSG91 response:', msg91Response.data)

      if (
        msg91Response.data?.type === 'error' ||
        msg91Response.data?.message?.toLowerCase?.().includes('flow id')
      ) {
        return response.status(500).json({
          message: 'Failed to send OTP.',
          details: msg91Response.data,
        })
      }
    } else {
      return response.status(500).json({
        message: 'MSG91 credentials are incomplete. Add auth key and flow id.',
      })
    }

    saveOtp(fullPhone, otp)
    response.json({ message: 'OTP sent successfully.' })
  } catch (error) {
    response.status(500).json({
      message: 'Failed to send OTP.',
      details: error.response?.data || error.message,
    })
  }
})

router.post('/verify', (request, response) => {
  const { mobile, countryCode, otp } = request.body

  if (!mobile || !countryCode || !otp) {
    return response.status(400).json({ message: 'Mobile, country code, and OTP are required.' })
  }

  const fullPhone = `${countryCode}${mobile}`
  const isValid = verifyOtp(fullPhone, otp)

  if (!isValid) {
    return response.status(400).json({ message: 'Invalid or expired OTP.' })
  }

  response.json({ message: 'OTP verified successfully.' })
})

export default router
