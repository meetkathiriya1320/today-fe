import React from "react";
import DOMPurify from "dompurify";

export default function SafeHtml({ html }) {
  const cleanHtml = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['b','i','em','strong','a','p','ul','li','br','img'], ALLOWED_ATTR: ['href','src','alt','title','rel','target'] });
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}
