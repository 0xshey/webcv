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

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  id,
}: RichTextEditorProps) {
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
        class:
          'min-h-[80px] rounded-md border border-border bg-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring',
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
    <div>
      {placeholder && !editor?.getText() && (
        <p className="pointer-events-none absolute text-muted-foreground">
          {placeholder}
        </p>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
