import mongoose from 'mongoose'

const formEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    mobile: { type: String, required: true, trim: true },
    countryCode: { type: String, required: true, trim: true, default: '+91' },
    otpVerified: { type: Boolean, required: true, default: false },
    parentMobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    schoolName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    stream: { type: String, required: true, trim: true },
    studentClass: { type: String, required: true, trim: true },
    indemnityAgreed: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  },
)

formEntrySchema.index({ countryCode: 1, mobile: 1 }, { unique: true })
formEntrySchema.index({ email: 1 }, { unique: true })

export default mongoose.model('FormEntry', formEntrySchema)
