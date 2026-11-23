import mongoose from 'mongoose';

/**
 * Counter Schema
 * Atomic sequential counter collection used to generate collision-free,
 * race-condition-free reference codes (e.g., SCCS-2026-001) under high concurrency.
 */
const CounterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false }
);

export const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

/**
 * Safely generates the next sequential reference ID in SCCS-YYYY-NNN format.
 * Uses atomic MongoDB $inc operator so concurrent requests receive strictly unique IDs.
 * 
 * @param {number} [year=currentYear]
 * @returns {Promise<string>} e.g. "SCCS-2026-001"
 */
export async function getNextComplaintReference(year = new Date().getFullYear()) {
  const counterId = `complaint_${year}`;
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(3, '0');
  return `SCCS-${year}-${paddedSeq}`;
}
