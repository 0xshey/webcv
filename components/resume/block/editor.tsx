"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResume } from "@/components/providers/resume-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "../rich-text/editor";
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
		<div className="flex flex-col gap-1">
			<Label htmlFor={htmlFor}>{label}</Label>
			{children}
			{error && <p className="text-red-500">{error}</p>}
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
			<Field>
				<FieldLabel htmlFor={`${blockId}-name`}>Company</FieldLabel>
				<Input id={`${blockId}-name`} {...register("name")} />
			</Field>

			<FieldRow
				label="Company"
				htmlFor={`${blockId}-name`}
				error={errors.name?.message}
			>
				<Input id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Position"
				htmlFor={`${blockId}-position`}
				error={errors.position?.message}
			>
				<Input id={`${blockId}-position`} {...register("position")} />
			</FieldRow>
			<FieldRow
				label="Website"
				htmlFor={`${blockId}-url`}
				error={errors.url?.message}
			>
				<Input id={`${blockId}-url`} type="url" {...register("url")} />
			</FieldRow>
			<div className="grid grid-cols-2 gap-3">
				<FieldRow
					label="Start Date"
					htmlFor={`${blockId}-start`}
					error={errors.startDate?.message}
				>
					<Input
						id={`${blockId}-start`}
						placeholder="YYYY-MM"
						{...register("startDate")}
					/>
				</FieldRow>
				<FieldRow
					label="End Date"
					htmlFor={`${blockId}-end`}
					error={errors.endDate?.message}
				>
					<Input
						id={`${blockId}-end`}
						placeholder="YYYY-MM or leave blank"
						{...register("endDate")}
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
				label="Institution"
				htmlFor={`${blockId}-inst`}
				error={errors.institution?.message}
			>
				<Input id={`${blockId}-inst`} {...register("institution")} />
			</FieldRow>
			<FieldRow
				label="Degree"
				htmlFor={`${blockId}-type`}
				error={errors.studyType?.message}
			>
				<Input
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
				<Input id={`${blockId}-area`} {...register("area")} />
			</FieldRow>
			<div className="grid grid-cols-2 gap-3">
				<FieldRow
					label="Start Date"
					htmlFor={`${blockId}-start`}
					error={errors.startDate?.message}
				>
					<Input
						id={`${blockId}-start`}
						placeholder="YYYY-MM"
						{...register("startDate")}
					/>
				</FieldRow>
				<FieldRow
					label="End Date"
					htmlFor={`${blockId}-end`}
					error={errors.endDate?.message}
				>
					<Input
						id={`${blockId}-end`}
						placeholder="YYYY-MM or leave blank"
						{...register("endDate")}
					/>
				</FieldRow>
			</div>
			<FieldRow
				label="GPA / Score"
				htmlFor={`${blockId}-score`}
				error={errors.score?.message}
			>
				<Input id={`${blockId}-score`} {...register("score")} />
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
				<Input id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Level"
				htmlFor={`${blockId}-level`}
				error={errors.level?.message}
			>
				<Input
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
				<Input
					id={`${blockId}-keywords`}
					placeholder="Comma-separated, e.g. HTML, CSS, JS"
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
				<Input id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="URL"
				htmlFor={`${blockId}-url`}
				error={errors.url?.message}
			>
				<Input id={`${blockId}-url`} type="url" {...register("url")} />
			</FieldRow>
			<div className="grid grid-cols-2 gap-3">
				<FieldRow
					label="Start Date"
					htmlFor={`${blockId}-start`}
					error={errors.startDate?.message}
				>
					<Input
						id={`${blockId}-start`}
						placeholder="YYYY-MM"
						{...register("startDate")}
					/>
				</FieldRow>
				<FieldRow
					label="End Date"
					htmlFor={`${blockId}-end`}
					error={errors.endDate?.message}
				>
					<Input
						id={`${blockId}-end`}
						placeholder="YYYY-MM or leave blank"
						{...register("endDate")}
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
				label="Organization"
				htmlFor={`${blockId}-org`}
				error={errors.organization?.message}
			>
				<Input id={`${blockId}-org`} {...register("organization")} />
			</FieldRow>
			<FieldRow
				label="Position"
				htmlFor={`${blockId}-pos`}
				error={errors.position?.message}
			>
				<Input id={`${blockId}-pos`} {...register("position")} />
			</FieldRow>
			<FieldRow
				label="URL"
				htmlFor={`${blockId}-url`}
				error={errors.url?.message}
			>
				<Input id={`${blockId}-url`} type="url" {...register("url")} />
			</FieldRow>
			<div className="grid grid-cols-2 gap-3">
				<FieldRow
					label="Start Date"
					htmlFor={`${blockId}-start`}
					error={errors.startDate?.message}
				>
					<Input
						id={`${blockId}-start`}
						placeholder="YYYY-MM"
						{...register("startDate")}
					/>
				</FieldRow>
				<FieldRow
					label="End Date"
					htmlFor={`${blockId}-end`}
					error={errors.endDate?.message}
				>
					<Input
						id={`${blockId}-end`}
						placeholder="YYYY-MM or leave blank"
						{...register("endDate")}
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
				<Input id={`${blockId}-title`} {...register("title")} />
			</FieldRow>
			<FieldRow
				label="Awarder"
				htmlFor={`${blockId}-awarder`}
				error={errors.awarder?.message}
			>
				<Input id={`${blockId}-awarder`} {...register("awarder")} />
			</FieldRow>
			<FieldRow
				label="Date"
				htmlFor={`${blockId}-date`}
				error={errors.date?.message}
			>
				<Input
					id={`${blockId}-date`}
					placeholder="YYYY-MM"
					{...register("date")}
				/>
			</FieldRow>
			<FieldRow
				label="Summary"
				htmlFor={`${blockId}-summary`}
				error={errors.summary?.message}
			>
				<Textarea id={`${blockId}-summary`} {...register("summary")} />
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
				<Input id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Publisher"
				htmlFor={`${blockId}-pub`}
				error={errors.publisher?.message}
			>
				<Input id={`${blockId}-pub`} {...register("publisher")} />
			</FieldRow>
			<FieldRow
				label="Release Date"
				htmlFor={`${blockId}-date`}
				error={errors.releaseDate?.message}
			>
				<Input
					id={`${blockId}-date`}
					placeholder="YYYY-MM"
					{...register("releaseDate")}
				/>
			</FieldRow>
			<FieldRow
				label="URL"
				htmlFor={`${blockId}-url`}
				error={errors.url?.message}
			>
				<Input id={`${blockId}-url`} type="url" {...register("url")} />
			</FieldRow>
			<FieldRow
				label="Summary"
				htmlFor={`${blockId}-summary`}
				error={errors.summary?.message}
			>
				<Textarea id={`${blockId}-summary`} {...register("summary")} />
			</FieldRow>
		</div>
	);
}

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
				<Input id={`${blockId}-lang`} {...register("language")} />
			</FieldRow>
			<FieldRow
				label="Fluency"
				htmlFor={`${blockId}-fluency`}
				error={errors.fluency?.message}
			>
				<Input
					id={`${blockId}-fluency`}
					placeholder="e.g. Native speaker, Fluent"
					{...register("fluency")}
				/>
			</FieldRow>
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
				<Input id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Keywords"
				htmlFor={`${blockId}-kw`}
				error={errors.keywords?.message}
			>
				<Input
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
				<Input id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Reference"
				htmlFor={`${blockId}-ref`}
				error={errors.reference?.message}
			>
				<Textarea
					id={`${blockId}-ref`}
					rows={4}
					{...register("reference")}
				/>
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
				<Input id={`${blockId}-name`} {...register("name")} />
			</FieldRow>
			<FieldRow
				label="Issuer"
				htmlFor={`${blockId}-issuer`}
				error={errors.issuer?.message}
			>
				<Input id={`${blockId}-issuer`} {...register("issuer")} />
			</FieldRow>
			<FieldRow
				label="Date"
				htmlFor={`${blockId}-date`}
				error={errors.date?.message}
			>
				<Input
					id={`${blockId}-date`}
					placeholder="YYYY-MM"
					{...register("date")}
				/>
			</FieldRow>
			<FieldRow
				label="URL"
				htmlFor={`${blockId}-url`}
				error={errors.url?.message}
			>
				<Input id={`${blockId}-url`} type="url" {...register("url")} />
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
