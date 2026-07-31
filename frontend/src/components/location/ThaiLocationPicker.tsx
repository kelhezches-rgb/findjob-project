'use client'
import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect'
import { PROVINCES, getDistrictsByProvince, getSubDistrictsByDistrict, District, SubDistrict } from '@/lib/thai-locations'

export interface ThaiLocationValue {
  provinceId?: number;    province?: string
  districtId?: number;    district?: string
  subDistrictId?: number; subDistrict?: string
}

interface ThaiLocationPickerProps {
  value: ThaiLocationValue
  onChange: (value: ThaiLocationValue) => void
  className?: string
}

const provinceOptions: SelectOption[] = PROVINCES.map(p => ({ id: p.id, label: p.nameTh }))

export function ThaiLocationPicker({ value, onChange, className = '' }: ThaiLocationPickerProps) {
  const [districts, setDistricts] = useState<District[]>([])
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingSubDistricts, setLoadingSubDistricts] = useState(false)

  // Load districts whenever the selected province changes.
  useEffect(() => {
    if (!value.provinceId) { setDistricts([]); return }
    let active = true
    setLoadingDistricts(true)
    getDistrictsByProvince(value.provinceId)
      .then(d => { if (active) setDistricts(d) })
      .finally(() => { if (active) setLoadingDistricts(false) })
    return () => { active = false }
  }, [value.provinceId])

  // Load subdistricts whenever the selected district changes.
  useEffect(() => {
    if (!value.districtId) { setSubDistricts([]); return }
    let active = true
    setLoadingSubDistricts(true)
    getSubDistrictsByDistrict(value.districtId)
      .then(d => { if (active) setSubDistricts(d) })
      .finally(() => { if (active) setLoadingSubDistricts(false) })
    return () => { active = false }
  }, [value.districtId])

  const districtOptions: SelectOption[] = districts.map(d => ({ id: d.id, label: d.nameTh }))
  const subDistrictOptions: SelectOption[] = subDistricts.map(s => ({ id: s.id, label: s.nameTh }))

  const handleProvince = (opt: SelectOption | null) => {
    onChange({
      provinceId: opt?.id, province: opt?.label,
      // Changing (or clearing) the province always resets the levels below it.
      districtId: undefined, district: undefined,
      subDistrictId: undefined, subDistrict: undefined,
    })
  }

  const handleDistrict = (opt: SelectOption | null) => {
    onChange({
      ...value,
      districtId: opt?.id, district: opt?.label,
      // Changing (or clearing) the district always resets the subdistrict.
      subDistrictId: undefined, subDistrict: undefined,
    })
  }

  const handleSubDistrict = (opt: SelectOption | null) => {
    onChange({ ...value, subDistrictId: opt?.id, subDistrict: opt?.label })
  }

  const hasAnySelection = Boolean(value.provinceId || value.districtId || value.subDistrictId)

  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${className}`}>
      <SearchableSelect
        placeholder="เลือกจังหวัด"
        value={value.provinceId ? { id: value.provinceId, label: value.province || '' } : null}
        options={provinceOptions}
        onChange={handleProvince}
      />
      <SearchableSelect
        placeholder="เลือกอำเภอ (ไม่บังคับ)"
        value={value.districtId ? { id: value.districtId, label: value.district || '' } : null}
        options={districtOptions}
        onChange={handleDistrict}
        disabled={!value.provinceId}
        disabledHint="กรุณาเลือกจังหวัดก่อน"
        loading={loadingDistricts}
      />
      <div className="flex items-center gap-2">
        <SearchableSelect
          placeholder="เลือกตำบล (ไม่บังคับ)"
          value={value.subDistrictId ? { id: value.subDistrictId, label: value.subDistrict || '' } : null}
          options={subDistrictOptions}
          onChange={handleSubDistrict}
          disabled={!value.districtId}
          disabledHint="กรุณาเลือกอำเภอก่อน"
          loading={loadingSubDistricts}
        />
        {hasAnySelection && (
          <button
            type="button"
            onClick={() => onChange({})}
            aria-label="ล้างตัวกรองที่ตั้ง"
            title="ล้างที่ตั้งทั้งหมด"
            className="flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
