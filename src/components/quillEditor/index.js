"use client";

import { useEffect, useRef } from "react";

const QuillEditor = ({ value, onChange, modules }) => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const valueRef = useRef(value);

    // Keep valueRef updated with latest prop
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        if (!editorRef.current || quillRef.current) return;

        (async () => {
            const QuillImport = await import("quill");
            const Quill = QuillImport.default || QuillImport;
            await import("quill/dist/quill.snow.css");

            // Image Upload Handler
            const imageHandler = function () {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";

                input.onchange = () => {
                    const file = input.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = () => {
                        const range = quillRef.current.getSelection(true);
                        quillRef.current.insertEmbed(range.index, "image", reader.result);
                    };
                    reader.readAsDataURL(file);
                };

                input.click();
            };

            // Initialize Quill
            const quill = new Quill(editorRef.current, {
                theme: "snow",
                modules: {
                    toolbar: {
                        container: [
                            [{ header: [1, 2, 3, 4, 5, 6, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ color: [] }, { background: [] }],
                            [{ list: "ordered" }, { list: "bullet" }],
                            [{ indent: "-1" }, { indent: "+1" }],
                            [{ align: [] }],
                            ["blockquote", "code-block"],
                            ["link", "image"],
                            ["clean"],
                        ],
                        handlers: { image: imageHandler },
                    },
                },
            });

            quillRef.current = quill;

            // Initial value - use ref to get latest value even if async load took time
            if (valueRef.current) {
                quill.clipboard.dangerouslyPasteHTML(valueRef.current);
            }

            quill.on("text-change", () => {
                onChange(quill.root.innerHTML);
            });

            // ---------------------------
            // 🚀 BRAVE BROWSER NESTED LIST FIX
            // ---------------------------
            const editor = editorRef.current.querySelector(".ql-editor");

            editor.addEventListener(
                "keydown",
                (e) => {
                    if (e.key !== "Tab") return;

                    const range = quill.getSelection(true);
                    if (!range) return;

                    const [line] = quill.getLine(range.index);
                    const formats = line.formats();

                    if (formats.list) {
                        e.preventDefault();
                        e.stopImmediatePropagation(); // Required in Brave (blocks bubbling)

                        const currentIndent = formats.indent || 0;

                        if (!e.shiftKey) {
                            // Tab → indent
                            quill.formatLine(range.index, 1, { indent: currentIndent + 1 });
                        } else {
                            // Shift+Tab → outdent
                            quill.formatLine(range.index, 1, {
                                indent: Math.max(currentIndent - 1, 0),
                            });
                        }

                        quill.setSelection(range.index, 0);
                    }
                },
                { capture: true } // Capture = bypass browser behavior
            );
            // ---------------------------

        })();
    }, []);

    // External value updates
    useEffect(() => {
        if (!quillRef.current) return;
        if (!value) return;
        if (value !== quillRef.current.root.innerHTML) {
            const selection = quillRef.current.getSelection();
            quillRef.current.clipboard.dangerouslyPasteHTML(value || "");
            if (selection) quillRef.current.setSelection(selection);
        }
    }, [value]);

    return (
        <div>
            <div

                ref={editorRef}
                style={{
                    height: "400px",
                    background: "#fff",
                }}
            />
        </div>
    );
};

export default QuillEditor;