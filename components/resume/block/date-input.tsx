'use client'

import { useRef, useState } from 'react'

const MONTHS = [
	{ value: '01', label: 'Jan' },
	{ value: '02', label: 'Feb' },
	{ value: '03', label: 'Mar' },
	{ value: '04', label: 'Apr' },
	{ value: '05', label: 'May' },
	{ value: '06', label: 'Jun' },
	{ value: '07', label: 'Jul' },
	{ value: '08', label: 'Aug' },
	{ value: '09', label: 'Sep' },
	{ value: '10', label: 'Oct' },
	{ value: '11', label: 'Nov' },
	{ value: '12', label: 'Dec' },
]

function parse(value: string): { year: string; month: string; day: string } {
	if (!value) return { year: '', month: '', day: '' }
	const parts = value.split('-')
	return { year: parts[0] ?? '', month: parts[1] ?? '', day: parts[2] ?? '' }
}

function assemble(year: string, month: string, day: string): string {
	if (!year) return ''
	if (!month) return year
	if (!day) return `${year}-${month}`
	return `${year}-${month}-${day}`
}

const segmentClass =
	'bg-transparent border-b border-border/40 focus:border-foreground/40 outline-none rounded-none px-0 py-0.5 placeholder:text-muted-foreground/30 transition-colors text-sm'

interface PartialDateInputProps {
	value: string
	onChange: (value: string) => void
	id?: string
}

export function PartialDateInput({ value, onChange, id }: PartialDateInputProps) {
	const parsed = parse(value)
	const [year, setYear] = useState(parsed.year)
	const [month, setMonth] = useState(parsed.month)
	const [day, setDay] = useState(parsed.day)

	const monthRef = useRef<HTMLSelectElement>(null)
	const dayRef = useRef<HTMLInputElement>(null)

	const emit = (y: string, m: string, d: string) => {
		onChange(assemble(y, m, d))
	}

	const handleYear = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.target.value.replace(/\D/g, '').slice(0, 4)
		setYear(v)
		emit(v, month, day)
		if (v.length === 4) monthRef.current?.focus()
	}

	const handleMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const v = e.target.value
		setMonth(v)
		if (!v) {
			setDay('')
			emit(year, '', '')
		} else {
			emit(year, v, day)
			dayRef.current?.focus()
		}
	}

	const handleDay = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
		setDay(raw)
		emit(year, month, raw)
	}

	return (
		<div className="flex items-center gap-1.5">
			<input
				id={id}
				type="text"
				inputMode="numeric"
				value={year}
				onChange={handleYear}
				placeholder="YYYY"
				maxLength={4}
				className={`${segmentClass} w-[3.2rem] text-center`}
			/>
			<span className="text-muted-foreground/30 select-none">–</span>
			<select
				ref={monthRef}
				value={month}
				onChange={handleMonth}
				className={`${segmentClass} text-center`}
			>
				<option value="">Month</option>
				{MONTHS.map((m) => (
					<option key={m.value} value={m.value}>
						{m.label}
					</option>
				))}
			</select>
			{month && (
				<>
					<span className="text-muted-foreground/30 select-none">–</span>
					<input
						ref={dayRef}
						type="text"
						inputMode="numeric"
						value={day}
						onChange={handleDay}
						placeholder="DD"
						maxLength={2}
						className={`${segmentClass} w-7 text-center`}
					/>
				</>
			)}
		</div>
	)
}
