import { useEffect, useState } from 'react'
import api from '../api'

const formTitle = import.meta.env.VITE_FORM_TITLE || 'Register Now'
const logoUrl = `${import.meta.env.BASE_URL}geu-logo.webp`

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
  'Puducherry'
]

const classOptions = [
  { value: 'class12-awaiting', label: 'Class 12 (Result Awaited)' },
  { value: 'class12-pursuing', label: 'Class 12 (Pursuing)' },
  { value: 'class11', label: 'Class 11' }
]

const streamOptions = [
  { value: 'PCM', label: 'PCM' },
  { value: 'PCB', label: 'PCB' },
  { value: 'Humanities', label: 'Humanities' },
  { value: 'Commerce', label: 'Commerce' },
]

const resendCooldownSeconds = 120

function formatSeconds(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const remainingSeconds = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

function ApplicationFormPage() {
  const [formValues, setFormValues] = useState({
    name: '',
    dob: '',
    mobile: '',
    countryCode: '+91',
    otp: '',
    parentMobile: '',
    email: '',
    schoolName: '',
    city: '',
    state: '',
    stream: '',
    studentClass: '',
    indemnityAgreed: false,
  })
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendSeconds, setResendSeconds] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(seconds - 1, 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendSeconds])

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (name === 'mobile' || name === 'countryCode') {
      setOtpVerified(false)
      setResendSeconds(0)
    }
  }

  async function handleSendOtp() {
    if (resendSeconds > 0) {
      return
    }

    setOtpMessage('')
    setSubmitMessage('')
    setIsSendingOtp(true)

    try {
      const response = await api.post('/otp/send', {
        mobile: formValues.mobile,
        countryCode: formValues.countryCode,
      })

      setOtpMessage(response.data.message)
      setResendSeconds(resendCooldownSeconds)
    } catch (error) {
      setOtpMessage(error.response?.data?.message || 'Failed to send OTP.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  async function handleVerifyOtp() {
    setOtpMessage('')
    setIsVerifyingOtp(true)

    try {
      const response = await api.post('/otp/verify', {
        mobile: formValues.mobile,
        countryCode: formValues.countryCode,
        otp: formValues.otp,
      })

      setOtpVerified(true)
      setOtpMessage(response.data.message)
    } catch (error) {
      setOtpVerified(false)
      setOtpMessage(error.response?.data?.message || 'OTP verification failed.')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitMessage('')

    if (!otpVerified) {
      setSubmitMessage('Please verify OTP before submitting.')
      return
    }

    if (!formValues.indemnityAgreed) {
      setSubmitMessage('Please agree to the Indemnity & Consent Declaration.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: formValues.name.trim(),
        dob: formValues.dob,
        mobile: formValues.mobile.trim(),
        countryCode: formValues.countryCode,
        otpVerified,
        parentMobile: formValues.parentMobile.trim(),
        email: formValues.email.trim(),
        schoolName: formValues.schoolName.trim(),
        city: formValues.city.trim(),
        state: formValues.state,
        stream: formValues.stream,
        studentClass: formValues.studentClass,
        indemnityAgreed: formValues.indemnityAgreed,
      }

      const response = await api.post('/forms', {
        ...payload,
      })

      setSubmitMessage(response.data.message)
      setIsSubmitted(true)
      setFormValues({
        name: '',
        dob: '',
        mobile: '',
        countryCode: '+91',
        otp: '',
        parentMobile: '',
        email: '',
        schoolName: '',
        city: '',
        state: '',
        stream: '',
        studentClass: '',
        indemnityAgreed: false,
      })
      setOtpVerified(false)
      setResendSeconds(0)
    } catch (error) {
      setSubmitMessage(error.response?.data?.message || 'Submission failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="hero-shell">
      <section className="hero-banner two-column">
        <div className="hero-overlay" />
        <img src={logoUrl} alt="Graphic Era University" className="hero-logo" />

        <div className="hero-content two-column-layout">
          {/* LEFT SIDE - Content */}
          <div className="left-content">
            <div className="content-header">
              <span className="content-badge">5-Day Residential Program</span>
              <h1 className="content-title">
                Future X 3.0 <span className="title-accent">Bootcamp</span>
              </h1>
              <p className="content-tagline">Experience College Before College</p>
            </div>

            <p className="content-description">
              A transformative journey where curiosity meets innovation. Join India's brightest Class 11 & 12 students for an immersive 5-day experience at the country's First Gen AI Campus.
            </p>

            <div className="content-highlights">
              <div className="highlight-card">
                <span className="h-icon">📅</span>
                <div className="h-text">
                  <strong>7-12 June 2026</strong>
                  <span>Reporting: 9:00 AM</span>
                </div>
              </div>
              <div className="highlight-card">
                <span className="h-icon">🎯</span>
                <div className="h-text">
                  <strong>Eligibility</strong>
                  <span>Class 11 & 12 Students</span>
                </div>
              </div>
              <div className="highlight-card free">
                <span className="h-icon">✓</span>
                <div className="h-text">
                  <strong>100% FREE</strong>
                  <span>No Registration Fee</span>
                </div>
              </div>
            </div>

            <div className="content-features">
              <h3>What You'll Experience</h3>
              <ul>
                <li>Hands-on AI & Emerging Tech Workshops</li>
                <li>1:1 Mentorship from Industry Leaders</li>
                <li>Networking with Innovators & Peers</li>
                <li>Career Guidance & Future Roadmaps</li>
                <li>Campus Life Experience</li>
              </ul>
            </div>

            <div className="content-venue">
              <p><strong>Venue:</strong> Graphic Era Deemed to be University</p>
              <p>Bell Road, Clement Town, Dehradun</p>
            </div>

            <div className="content-footer">
              <p className="footer-tagline">Connect. Learn. Lead.</p>
              <p className="footer-sub">Your future starts here.</p>
            </div>
          </div>

          {/* RIGHT SIDE - Form */}
          <div className="right-form">
            <div className="form-container">
              {isSubmitted ? (
                <div className="thank-you-panel">
                  <div className="thank-you-mark">✓</div>
                  <h2>Thank You</h2>
                  <p>Your registration has been submitted successfully.</p>
                  <span>We look forward to seeing you at Future X 3.0 Bootcamp.</span>
                </div>
              ) : (
                <>
                  <div className="form-header-right">
                    <h2>Register Now</h2>
                    <p>Secure your spot for this exclusive program</p>
                  </div>
                  <form className="registration-form-right" onSubmit={handleSubmit}>
              <div className="field-row full-width">
                <label>
                  <input name="name" value={formValues.name} onChange={handleChange} type="text" placeholder="Name *" required />
                </label>
              </div>

              <div className="field-row full-width">
                <label>
                  <input name="dob" value={formValues.dob} onChange={handleChange} type="date" placeholder="Date of Birth *" required />
                </label>
              </div>

              <div className="field-row full-width phone-row">
                <label className="country-prefix">
                  <select name="countryCode" value={formValues.countryCode} onChange={handleChange}>
                    <option value="+91">+91</option>
                  </select>
                </label>
                <label className="phone-input">
                  <input
                    name="mobile"
                    value={formValues.mobile}
                    onChange={handleChange}
                    type="tel"
                    placeholder="Contact No. *"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                  />
                </label>
              </div>

              <div className="field-row full-width otp-actions-row">
                <button
                  className="secondary-action"
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || resendSeconds > 0 || !formValues.mobile || formValues.mobile.length !== 10}
                >
                  {isSendingOtp ? 'Sending...' : resendSeconds > 0 ? `Resend ${formatSeconds(resendSeconds)}` : 'Send OTP'}
                </button>
                <div className="otp-row">
                  <input name="otp" value={formValues.otp} onChange={handleChange} type="text" placeholder="Enter OTP" maxLength="6" />
                  <button className="verify-button" type="button" onClick={handleVerifyOtp} disabled={isVerifyingOtp || !formValues.otp}>
                    {isVerifyingOtp ? 'Verifying' : 'Verify'}
                  </button>
                </div>
              </div>
              {otpVerified && <p className="status-message success">OTP Verified</p>}

              <div className="field-row full-width">
                <label>
                  <input
                    name="parentMobile"
                    value={formValues.parentMobile}
                    onChange={handleChange}
                    type="tel"
                    placeholder="Parents No. *"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                  />
                </label>
              </div>

              <div className="field-row full-width">
                <label>
                  <input
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email Id *"
                    required
                  />
                </label>
              </div>

              <div className="field-row full-width">
                <label>
                  <input name="schoolName" value={formValues.schoolName} onChange={handleChange} type="text" placeholder="School Name *" required />
                </label>
              </div>

              <div className="field-row full-width">
                <label>
                  <input name="city" value={formValues.city} onChange={handleChange} type="text" placeholder="City *" required />
                </label>
              </div>

              <div className="field-row full-width">
                <label>
                  <select name="state" value={formValues.state} onChange={handleChange} required>
                    <option value="">Select State *</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="field-row full-width">
                <label>
                  <select name="stream" value={formValues.stream} onChange={handleChange} required>
                    <option value="">Select Stream *</option>
                    {streamOptions.map((stream) => (
                      <option key={stream.value} value={stream.value}>{stream.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="field-row full-width">
                <label>
                  <select name="studentClass" value={formValues.studentClass} onChange={handleChange} required>
                    <option value="">Select Class *</option>
                    {classOptions.map((cls) => (
                      <option key={cls.value} value={cls.value}>{cls.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="field-row full-width indemnity-row">
                <div className="indemnity-label">
                  <strong>Indemnity & Consent Declaration</strong>
                  <p className="indemnity-text">
                    I, the undersigned student, voluntarily agree to participate in the 5-Day Residential Boot Camp at the campus of Graphic Era Deemed to be University.I am participating of my own free will, and I shall be solely responsible for my personal belongings, and adherence to the institution’s rules, discipline, and code of conduct, during my travel.I undertake to maintain proper behavior and follow all safety guidelines. The institution shall not be held liable for any personal loss, injury, or unforeseen circumstances arising during my participation.
                  </p>
                  <label className="checkbox-wrapper">
                    <input
                      name="indemnityAgreed"
                      checked={formValues.indemnityAgreed}
                      onChange={handleChange}
                      type="checkbox"
                      required
                    />
                    <span>I Agree *</span>
                  </label>
                </div>
              </div>

              {otpMessage && !otpVerified && <p className="status-message">{otpMessage}</p>}
              {submitMessage && <p className="status-message">{submitMessage}</p>}

              <div className="full-width form-footer">
                <button type="submit" disabled={isSubmitting || !otpVerified}>
                  {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                </button>
              </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Mobile Only: Text Details (shown after form) */}
          <div className="mobile-details">
            <div className="details-highlights">
              <div className="highlight-card">
                <span className="h-icon">📅</span>
                <div className="h-text">
                  <strong>7-12 June 2026</strong>
                  <span>Reporting: 9:00 AM</span>
                </div>
              </div>
              <div className="highlight-card">
                <span className="h-icon">🎯</span>
                <div className="h-text">
                  <strong>Eligibility</strong>
                  <span>Class 11 & 12 Students</span>
                </div>
              </div>
              <div className="highlight-card free">
                <span className="h-icon">✓</span>
                <div className="h-text">
                  <strong>100% FREE</strong>
                  <span>No Registration Fee</span>
                </div>
              </div>
            </div>

            <div className="details-features">
              <h3>What You'll Experience</h3>
              <ul>
                <li>Hands-on AI & Emerging Tech Workshops</li>
                <li>1:1 Mentorship from Industry Leaders</li>
                <li>Networking with Innovators & Peers</li>
                <li>Career Guidance & Future Roadmaps</li>
                <li>Campus Life Experience</li>
              </ul>
            </div>

            <div className="details-venue">
              <p><strong>Venue:</strong> Graphic Era Deemed to be University</p>
              <p>Bell Road, Clement Town, Dehradun</p>
            </div>

            <div className="details-footer">
              <p className="tagline">Connect. Learn. Lead.</p>
              <p className="sub">Your future starts here.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ApplicationFormPage
