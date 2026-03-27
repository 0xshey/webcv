'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
}

export function RichTextEditor({ value, onChange, placeholder, id }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        bold: false,
        italic: false,
        strike: false,
        code: false,
      }),
    ],
    immediatelyRender: false,
    content: value,
    editorProps: {
      attributes: {
        id: id ?? '',
        class: 'min-h-[60px] outline-none [&_ul]:list-disc [&_ul]:pl-4',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      {placeholder && !editor?.getText() && (
        <p className="pointer-events-none absolute top-0 text-sm text-muted-foreground/40">
          {placeholder}
        </p>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
