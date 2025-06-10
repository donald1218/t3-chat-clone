"use client";

import { useEffect, useState } from "react";
import { MarkdownHooks } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";

import "./markdown.css";

interface LlmResponseDisplayProps {
  response: string | null;
}

export default function LlmResponseDisplay({
  response,
}: LlmResponseDisplayProps) {
  const [formattedResponse, setFormattedResponse] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!response) {
      setFormattedResponse(null);
      return;
    }

    // Minimal formatting before passing to the Markdown renderer
    const formatted = response.trim();
    setFormattedResponse(formatted);
  }, [response]);

  if (!formattedResponse) {
    return null;
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <MarkdownHooks
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[() => rehypePrettyCode({ theme: "one-dark-pro" })]}
        components={{
          // Custom styling for code blocks
          code({ children, className, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;

            return isInline ? (
              <div className="rounded-lg">
                <code className="px-1 py-0.5 rounded-lg" {...props}>
                  {children}
                </code>
              </div>
            ) : (
              <div className="relative rounded-lg">
                <pre className={`${className} rounded-lg p-4 overflow-x-auto`}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          // Apply Tailwind classes for other elements
          a({ children, ...props }) {
            return (
              <a
                className="text-blue-600 dark:text-blue-400 hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          h1({ children, ...props }) {
            return (
              <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>
                {children}
              </h1>
            );
          },
          h2({ children, ...props }) {
            return (
              <h2 className="text-xl font-bold mt-5 mb-3" {...props}>
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            return (
              <h3 className="text-lg font-bold mt-4 mb-2" {...props}>
                {children}
              </h3>
            );
          },
          ul({ children, ...props }) {
            return (
              <ul className="list-disc pl-6 my-3" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="list-decimal pl-6 my-3" {...props}>
                {children}
              </ol>
            );
          },
          li({ children, ...props }) {
            return (
              <li className="mb-1" {...props}>
                {children}
              </li>
            );
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-gray-300 pl-4 italic my-3"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-4">
                <table
                  className="min-w-full divide-y divide-gray-300 dark:divide-gray-700"
                  {...props}
                >
                  {children}
                </table>
              </div>
            );
          },
          thead({ children, ...props }) {
            return (
              <thead className="bg-gray-100 dark:bg-gray-800" {...props}>
                {children}
              </thead>
            );
          },
          tbody({ children, ...props }) {
            return (
              <tbody
                className="divide-y divide-gray-200 dark:divide-gray-800"
                {...props}
              >
                {children}
              </tbody>
            );
          },
          tr({ children, ...props }) {
            return (
              <tr
                className="hover:bg-gray-50 dark:hover:bg-gray-900"
                {...props}
              >
                {children}
              </tr>
            );
          },
          th({ children, ...props }) {
            return (
              <th
                className="px-3 py-2 text-left text-sm font-medium"
                {...props}
              >
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td className="px-3 py-2 text-sm" {...props}>
                {children}
              </td>
            );
          },
        }}
      >
        {formattedResponse}
      </MarkdownHooks>
    </div>
  );
}
