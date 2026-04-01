"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResume } from "@/components/providers/resume-provider";
import { RichTextEditor } from "../rich-text/editor";
import { PartialDateInput } from "./date-input";
import {
	workItemSchema,
	educationItemSchema,
	skillItemSchema,
	projectItemSchema,
	volunteerItemSchema,
	awardItemSchema,
	publicationItemSchema,
	languageItemSchema,
	interestItemSchema,
	referenceItemSchema,
	certificateItemSchema,
} from "@/lib/validations/resume";
import type { SectionKey } from "@/lib/types";
import type { z } from "zod";

type BlockEditorProps = {
	section: Exclude<SectionKey, "basics">;
	blockId: string;
	initialValues: Record<string, unknown>;
};

function BareInput({
	className = "",
	...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className={`w-full bg-transparent border-b border-border/40 focus:border-foreground/40 outline-none rounded-none px-0 py-0.5 placeholder:text-muted-foreground/30 transition-colors ${className}`}
			{...props}
		/>
	);
}

function BareTextarea({
	className = "",
	...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			className={`w-full bg-transparent border-b border-border/40 focus:border-foreground/40 outline-none rounded-none px-0 py-0.5 placeholder:text-muted-foreground/30 resize-none transition-colors ${className}`}
			{...props}
		/>
	);
}

function FieldRow({
	label,
	htmlFor,
	error,
	children,
}: {
	label: string;
	htmlFor: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-0.5">
			<label htmlFor={htmlFor} className="text-muted-foreground/60 text-sm">
				{label}
			</label>
			{children}
			{error && (
				<p className="text-xs text-destructive mt-0.5">{error}</p>
			)}
		</div>
	);
}

function WorkEditor({
	blockId,
	initialValues,
}: {
	blockId: string;
	initialValues: Record<string, unknown>;
}) {
	const { dispatch } = useResume();
	type FormValues = z.infer<typeof workItemSchema>;

	const {
		register,
		control,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(workItemSchema),
		defaultValues: initialValues as FormValues,
	});

	const values = watch();

	useEffect(() => {
		dispatch({
			type: "UPDATE_BLOCK",
			section: "work",
			id: blockId,
			payload: values,
		});
	}, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-3">
			<FieldRow
				label="Position"
				htmlFor={`${blockId}-position`}
				error={errors.position?.message}
			>
				<BareInput id={`${blockId}-position`} {...register("position")} />
			</FieldRow>
			<FieldRow
				label="Company"
				htmlFor={`${blockId}-name`}
				error={errors.name?.message}
			>
				<BareInput id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Website"
				htmlFor={`${blockId}-url`}
				error={errors.url?.message}
			>
				<BareInput id={`${blockId}-url`} type="url" {...register("url")} />
			</FieldRow>
			<div className="grid grid-cols-2 gap-3">
				<FieldRow
					label="Start Date"
					htmlFor={`${blockId}-start`}
					error={errors.startDate?.message}
				>
					<Controller
						control={control}
						name="startDate"
						render={({ field }) => (
							<PartialDateInput
								id={`${blockId}-start`}
								value={field.value ?? ""}
								onChange={field.onChange}
							/>
						)}
					/>
				</FieldRow>
				<FieldRow
					label="End Date"
					htmlFor={`${blockId}-end`}
					error={errors.endDate?.message}
				>
					<Controller
						control={control}
						name="endDate"
						render={({ field }) => (
							<PartialDateInput
								id={`${blockId}-end`}
								value={field.value ?? ""}
								onChange={field.onChange}
							/>
						)}
					/>
				</FieldRow>
			</div>
			<FieldRow label="Summary" htmlFor={`${blockId}-summary`}>
				<Controller
					control={control}
					name="summary"
					render={({ field }) => (
						<RichTextEditor
							key={blockId}
							value={field.value ?? ""}
							onChange={field.onChange}
							id={`${blockId}-summary`}
						/>
					)}
				/>
			</FieldRow>
		</div>
	);
}

function EducationEditor({
	blockId,
	initialValues,
}: {
	blockId: string;
	initialValues: Record<string, unknown>;
}) {
	const { dispatch } = useResume();
	type FormValues = z.infer<typeof educationItemSchema>;

	const {
		register,
		control,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(educationItemSchema),
		defaultValues: initialValues as FormValues,
	});

	const values = watch();

	useEffect(() => {
		dispatch({
			type: "UPDATE_BLOCK",
			section: "education",
			id: blockId,
			payload: values,
		});
	}, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-3">
			<FieldRow
				label="Degree"
				htmlFor={`${blockId}-type`}
				error={errors.studyType?.message}
			>
				<BareInput
					id={`${blockId}-type`}
					placeholder="e.g. Bachelor"
					{...register("studyType")}
				/>
			</FieldRow>
			<FieldRow
				label="Field of Study"
				htmlFor={`${blockId}-area`}
				error={errors.area?.message}
			>
				<BareInput id={`${blockId}-area`} {...register("area")} />
			</FieldRow>
			<FieldRow
				label="Institution"
				htmlFor={`${blockId}-inst`}
				error={errors.institution?.message}
			>
				<BareInput id={`${blockId}-inst`} {...register("institution")} />
			</FieldRow>
			<div className="grid grid-cols-2 gap-3">
				<FieldRow
					label="Start Date"
					htmlFor={`${blockId}-start`}
					error={errors.startDate?.message}
				>
					<Controller
						control={control}
						name="startDate"
						render={({ field }) => (
							<PartialDateInput
								id={`${blockId}-start`}
								value={field.value ?? ""}
								onChange={field.onChange}
							/>
						)}
					/>
				</FieldRow>
				<FieldRow
					label="End Date"
					htmlFor={`${blockId}-end`}
					error={errors.endDate?.message}
				>
					<Controller
						control={control}
						name="endDate"
						render={({ field }) => (
							<PartialDateInput
								id={`${blockId}-end`}
								value={field.value ?? ""}
								onChange={field.onChange}
							/>
						)}
					/>
				</FieldRow>
			</div>
			<FieldRow
				label="GPA / Score"
				htmlFor={`${blockId}-score`}
				error={errors.score?.message}
			>
				<BareInput id={`${blockId}-score`} {...register("score")} />
			</FieldRow>
		</div>
	);
}

function SkillEditor({
	blockId,
	initialValues,
}: {
	blockId: string;
	initialValues: Record<string, unknown>;
}) {
	const { dispatch } = useResume();
	type FormValues = z.infer<typeof skillItemSchema>;

	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(skillItemSchema),
		defaultValues: initialValues as FormValues,
	});

	const values = watch();

	useEffect(() => {
		dispatch({
			type: "UPDATE_BLOCK",
			section: "skills",
			id: blockId,
			payload: values,
		});
	}, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-3">
			<FieldRow
				label="Skill"
				htmlFor={`${blockId}-name`}
				error={errors.name?.message}
			>
				<BareInput id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Level"
				htmlFor={`${blockId}-level`}
				error={errors.level?.message}
			>
				<BareInput
					id={`${blockId}-level`}
					placeholder="e.g. Expert, Intermediate"
					{...register("level")}
				/>
			</FieldRow>
			<FieldRow
				label="Keywords"
				htmlFor={`${blockId}-keywords`}
				error={errors.keywords?.message}
			>
				<BareInput
					id={`${blockId}-keywords`}
					placeholder="Comma-separated"
					{...register("keywords")}
				/>
			</FieldRow>
		</div>
	);
}

function ProjectEditor({
	blockId,
	initialValues,
}: {
	blockId: string;
	initialValues: Record<string, unknown>;
}) {
	const { dispatch } = useResume();
	type FormValues = z.infer<typeof projectItemSchema>;

	const {
		register,
		control,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(projectItemSchema),
		defaultValues: initialValues as FormValues,
	});

	const values = watch();

	useEffect(() => {
		dispatch({
			type: "UPDATE_BLOCK",
			section: "projects",
			id: blockId,
			payload: values,
		});
	}, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-3">
			<FieldRow
				label="Project Name"
				htmlFor={`${blockId}-name`}
				error={errors.name?.message}
			>
				<BareInput id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="URL"
				htmlFor={`${blockId}-url`}
				error={errors.url?.message}
			>
				<BareInput id={`${blockId}-url`} type="url" {...register("url")} />
			</FieldRow>
			<div className="grid grid-cols-2 gap-3">
				<FieldRow
					label="Start Date"
					htmlFor={`${blockId}-start`}
					error={errors.startDate?.message}
				>
					<Controller
						control={control}
						name="startDate"
						render={({ field }) => (
							<PartialDateInput
								id={`${blockId}-start`}
								value={field.value ?? ""}
								onChange={field.onChange}
							/>
						)}
					/>
				</FieldRow>
				<FieldRow
					label="End Date"
					htmlFor={`${blockId}-end`}
					error={errors.endDate?.message}
				>
					<Controller
						control={control}
						name="endDate"
						render={({ field }) => (
							<PartialDateInput
								id={`${blockId}-end`}
								value={field.value ?? ""}
								onChange={field.onChange}
							/>
						)}
					/>
				</FieldRow>
			</div>
			<FieldRow label="Description" htmlFor={`${blockId}-desc`}>
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<RichTextEditor
							key={blockId}
							value={field.value ?? ""}
							onChange={field.onChange}
							id={`${blockId}-desc`}
						/>
					)}
				/>
			</FieldRow>
		</div>
	);
}

function VolunteerEditor({
	blockId,
	initialValues,
}: {
	blockId: string;
	initialValues: Record<string, unknown>;
}) {
	const { dispatch } = useResume();
	type FormValues = z.infer<typeof volunteerItemSchema>;

	const {
		register,
		control,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(volunteerItemSchema),
		defaultValues: initialValues as FormValues,
	});

	const values = watch();

	useEffect(() => {
		dispatch({
			type: "UPDATE_BLOCK",
			section: "volunteer",
			id: blockId,
			payload: values,
		});
	}, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-3">
			<FieldRow
				label="Position"
				htmlFor={`${blockId}-pos`}
				error={errors.position?.message}
			>
				<BareInput id={`${blockId}-pos`} {...register("position")} />
			</FieldRow>
			<FieldRow
				label="Organization"
				htmlFor={`${blockId}-org`}
				error={errors.organization?.message}
			>
				<BareInput id={`${blockId}-org`} {...register("organization")} />
			</FieldRow>
			<FieldRow
				label="URL"
				htmlFor={`${blockId}-url`}
				error={errors.url?.message}
			>
				<BareInput id={`${blockId}-url`} type="url" {...register("url")} />
			</FieldRow>
			<div className="grid grid-cols-2 gap-3">
				<FieldRow
					label="Start Date"
					htmlFor={`${blockId}-start`}
					error={errors.startDate?.message}
				>
					<Controller
						control={control}
						name="startDate"
						render={({ field }) => (
							<PartialDateInput
								id={`${blockId}-start`}
								value={field.value ?? ""}
								onChange={field.onChange}
							/>
						)}
					/>
				</FieldRow>
				<FieldRow
					label="End Date"
					htmlFor={`${blockId}-end`}
					error={errors.endDate?.message}
				>
					<Controller
						control={control}
						name="endDate"
						render={({ field }) => (
							<PartialDateInput
								id={`${blockId}-end`}
								value={field.value ?? ""}
								onChange={field.onChange}
							/>
						)}
					/>
				</FieldRow>
			</div>
			<FieldRow label="Summary" htmlFor={`${blockId}-summary`}>
				<Controller
					control={control}
					name="summary"
					render={({ field }) => (
						<RichTextEditor
							key={blockId}
							value={field.value ?? ""}
							onChange={field.onChange}
							id={`${blockId}-summary`}
						/>
					)}
				/>
			</FieldRow>
		</div>
	);
}

function AwardEditor({
	blockId,
	initialValues,
}: {
	blockId: string;
	initialValues: Record<string, unknown>;
}) {
	const { dispatch } = useResume();
	type FormValues = z.infer<typeof awardItemSchema>;

	const {
		register,
		control,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(awardItemSchema),
		defaultValues: initialValues as FormValues,
	});

	const values = watch();

	useEffect(() => {
		dispatch({
			type: "UPDATE_BLOCK",
			section: "awards",
			id: blockId,
			payload: values,
		});
	}, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-3">
			<FieldRow
				label="Title"
				htmlFor={`${blockId}-title`}
				error={errors.title?.message}
			>
				<BareInput id={`${blockId}-title`} {...register("title")} />
			</FieldRow>
			<FieldRow
				label="Awarder"
				htmlFor={`${blockId}-awarder`}
				error={errors.awarder?.message}
			>
				<BareInput id={`${blockId}-awarder`} {...register("awarder")} />
			</FieldRow>
			<FieldRow
				label="Date"
				htmlFor={`${blockId}-date`}
				error={errors.date?.message}
			>
				<Controller
					control={control}
					name="date"
					render={({ field }) => (
						<PartialDateInput
							id={`${blockId}-date`}
							value={field.value ?? ""}
							onChange={field.onChange}
						/>
					)}
				/>
			</FieldRow>
			<FieldRow label="Summary" htmlFor={`${blockId}-summary`}>
				<Controller
					control={control}
					name="summary"
					render={({ field }) => (
						<RichTextEditor
							key={blockId}
							value={field.value ?? ""}
							onChange={field.onChange}
							id={`${blockId}-summary`}
						/>
					)}
				/>
			</FieldRow>
		</div>
	);
}

function PublicationEditor({
	blockId,
	initialValues,
}: {
	blockId: string;
	initialValues: Record<string, unknown>;
}) {
	const { dispatch } = useResume();
	type FormValues = z.infer<typeof publicationItemSchema>;

	const {
		register,
		control,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(publicationItemSchema),
		defaultValues: initialValues as FormValues,
	});

	const values = watch();

	useEffect(() => {
		dispatch({
			type: "UPDATE_BLOCK",
			section: "publications",
			id: blockId,
			payload: values,
		});
	}, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-3">
			<FieldRow
				label="Name"
				htmlFor={`${blockId}-name`}
				error={errors.name?.message}
			>
				<BareInput id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Publisher"
				htmlFor={`${blockId}-pub`}
				error={errors.publisher?.message}
			>
				<BareInput id={`${blockId}-pub`} {...register("publisher")} />
			</FieldRow>
			<FieldRow
				label="Release Date"
				htmlFor={`${blockId}-date`}
				error={errors.releaseDate?.message}
			>
				<Controller
					control={control}
					name="releaseDate"
					render={({ field }) => (
						<PartialDateInput
							id={`${blockId}-date`}
							value={field.value ?? ""}
							onChange={field.onChange}
						/>
					)}
				/>
			</FieldRow>
			<FieldRow
				label="URL"
				htmlFor={`${blockId}-url`}
				error={errors.url?.message}
			>
				<BareInput id={`${blockId}-url`} type="url" {...register("url")} />
			</FieldRow>
			<FieldRow label="Summary" htmlFor={`${blockId}-summary`}>
				<Controller
					control={control}
					name="summary"
					render={({ field }) => (
						<RichTextEditor
							key={blockId}
							value={field.value ?? ""}
							onChange={field.onChange}
							id={`${blockId}-summary`}
						/>
					)}
				/>
			</FieldRow>
		</div>
	);
}

const FLUENCY_OPTIONS = [
	{
		value: "Basic",
		label: "Basic",
		description: "A1–A2: Elementary understanding, simple phrases, basic daily interaction",
	},
	{
		value: "Independent",
		label: "Independent",
		description: "B1–B2: Handles everyday situations, expresses opinions with reasonable fluency",
	},
	{
		value: "Proficient",
		label: "Proficient",
		description: "C1–C2: Fluent and spontaneous, understands complex texts (C2 is near-native)",
	},
];

function LanguageEditor({
	blockId,
	initialValues,
}: {
	blockId: string;
	initialValues: Record<string, unknown>;
}) {
	const { dispatch } = useResume();
	type FormValues = z.infer<typeof languageItemSchema>;

	const {
		register,
		control,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(languageItemSchema),
		defaultValues: initialValues as FormValues,
	});

	const values = watch();

	useEffect(() => {
		dispatch({
			type: "UPDATE_BLOCK",
			section: "languages",
			id: blockId,
			payload: values,
		});
	}, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-3">
			<FieldRow
				label="Language"
				htmlFor={`${blockId}-lang`}
				error={errors.language?.message}
			>
				<BareInput id={`${blockId}-lang`} {...register("language")} />
			</FieldRow>
			<div className="flex flex-col gap-1.5">
				<span className="text-muted-foreground/60 text-sm">Fluency</span>
				{errors.fluency?.message && (
					<p className="text-xs text-destructive">{errors.fluency.message}</p>
				)}
				<Controller
					control={control}
					name="fluency"
					render={({ field }) => (
						<RadioGroup
							value={field.value ?? ""}
							onValueChange={field.onChange}
							className="flex flex-col gap-2"
						>
							{FLUENCY_OPTIONS.map((opt) => (
								<label
									key={opt.value}
									className={`flex items-start gap-3 rounded-md bg-muted px-3 py-2.5 cursor-pointer transition-colors ${
										field.value === opt.value ? "border" : ""
									}`}
								>
									<RadioGroupItem value={opt.value} className="mt-0.5 shrink-0" />
									<div className="flex flex-col gap-0.5">
										<span className="font-semibold text-sm leading-tight">{opt.label}</span>
										<span className="text-muted-foreground text-xs leading-snug">{opt.description}</span>
									</div>
								</label>
							))}
						</RadioGroup>
					)}
				/>
			</div>
		</div>
	);
}

function InterestEditor({
	blockId,
	initialValues,
}: {
	blockId: string;
	initialValues: Record<string, unknown>;
}) {
	const { dispatch } = useResume();
	type FormValues = z.infer<typeof interestItemSchema>;

	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(interestItemSchema),
		defaultValues: initialValues as FormValues,
	});

	const values = watch();

	useEffect(() => {
		dispatch({
			type: "UPDATE_BLOCK",
			section: "interests",
			id: blockId,
			payload: values,
		});
	}, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-3">
			<FieldRow
				label="Interest"
				htmlFor={`${blockId}-name`}
				error={errors.name?.message}
			>
				<BareInput id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Keywords"
				htmlFor={`${blockId}-kw`}
				error={errors.keywords?.message}
			>
				<BareInput
					id={`${blockId}-kw`}
					placeholder="Comma-separated"
					{...register("keywords")}
				/>
			</FieldRow>
		</div>
	);
}

function ReferenceEditor({
	blockId,
	initialValues,
}: {
	blockId: string;
	initialValues: Record<string, unknown>;
}) {
	const { dispatch } = useResume();
	type FormValues = z.infer<typeof referenceItemSchema>;

	const {
		register,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(referenceItemSchema),
		defaultValues: initialValues as FormValues,
	});

	const values = watch();

	useEffect(() => {
		dispatch({
			type: "UPDATE_BLOCK",
			section: "references",
			id: blockId,
			payload: values,
		});
	}, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-3">
			<FieldRow
				label="Name"
				htmlFor={`${blockId}-name`}
				error={errors.name?.message}
			>
				<BareInput id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Reference"
				htmlFor={`${blockId}-ref`}
				error={errors.reference?.message}
			>
				<BareTextarea id={`${blockId}-ref`} rows={4} {...register("reference")} />
			</FieldRow>
		</div>
	);
}

function CertificateEditor({
	blockId,
	initialValues,
}: {
	blockId: string;
	initialValues: Record<string, unknown>;
}) {
	const { dispatch } = useResume();
	type FormValues = z.infer<typeof certificateItemSchema>;

	const {
		register,
		control,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(certificateItemSchema),
		defaultValues: initialValues as FormValues,
	});

	const values = watch();

	useEffect(() => {
		dispatch({
			type: "UPDATE_BLOCK",
			section: "certificates",
			id: blockId,
			payload: values,
		});
	}, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-3">
			<FieldRow
				label="Certificate Name"
				htmlFor={`${blockId}-name`}
				error={errors.name?.message}
			>
				<BareInput id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Issuer"
				htmlFor={`${blockId}-issuer`}
				error={errors.issuer?.message}
			>
				<BareInput id={`${blockId}-issuer`} {...register("issuer")} />
			</FieldRow>
			<FieldRow
				label="Date"
				htmlFor={`${blockId}-date`}
				error={errors.date?.message}
			>
				<Controller
					control={control}
					name="date"
					render={({ field }) => (
						<PartialDateInput
							id={`${blockId}-date`}
							value={field.value ?? ""}
							onChange={field.onChange}
						/>
					)}
				/>
			</FieldRow>
			<FieldRow
				label="URL"
				htmlFor={`${blockId}-url`}
				error={errors.url?.message}
			>
				<BareInput id={`${blockId}-url`} type="url" {...register("url")} />
			</FieldRow>
		</div>
	);
}

const sectionEditors: Record<
	Exclude<SectionKey, "basics">,
	React.ComponentType<{
		blockId: string;
		initialValues: Record<string, unknown>;
	}>
> = {
	work: WorkEditor,
	education: EducationEditor,
	skills: SkillEditor,
	projects: ProjectEditor,
	volunteer: VolunteerEditor,
	awards: AwardEditor,
	publications: PublicationEditor,
	languages: LanguageEditor,
	interests: InterestEditor,
	references: ReferenceEditor,
	certificates: CertificateEditor,
};

export function BlockEditor({
	section,
	blockId,
	initialValues,
}: BlockEditorProps) {
	const Editor = sectionEditors[section];
	if (!Editor) return null;
	return <Editor blockId={blockId} initialValues={initialValues} />;
}
