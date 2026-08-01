import { ExperienceLevel } from '@/types'

// Bilingual display labels for the Experience Level dropdown — English enum
// value + Thai translation, e.g. "entry - ระดับเริ่มต้น". The value actually
// submitted to the backend is always the plain enum key (unchanged), never
// this label — see JobPostForm.tsx's <option value={key}>.
export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  entry:     'entry - ระดับเริ่มต้น',
  mid:       'mid - ระดับกลาง',
  senior:    'senior - ระดับอาวุโส',
  lead:      'lead - หัวหน้าทีม',
  executive: 'executive - ระดับผู้บริหาร',
}

// This project has no NOT_REQUIRED enum member — "not specified" is
// represented as an empty/undefined experienceLevel instead (see
// JobPostForm.tsx's `<option value="">`). Kept as its own constant so any
// dropdown can label that option consistently with the others.
export const EXPERIENCE_LEVEL_NOT_SPECIFIED_LABEL = 'NOT_REQUIRED - ไม่ระบุ'
