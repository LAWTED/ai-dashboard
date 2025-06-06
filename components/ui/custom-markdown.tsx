"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { ComponentPropsWithoutRef } from "react";
import remarkGfm from "remark-gfm";

interface CustomMarkdownProps
  extends ComponentPropsWithoutRef<typeof ReactMarkdown> {
  children: string;
}

// Define a type for code props
interface CustomCodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function CustomMarkdown({ children, ...props }: CustomMarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        h1: (props) => (
          <h1 className="text-2xl font-bold mb-2 mt-4" {...props} />
        ),
        h2: (props) => (
          <h2 className="text-xl font-semibold mb-2 mt-3" {...props} />
        ),
        h3: (props) => (
          <h3 className="text-lg font-medium mb-1 mt-2" {...props} />
        ),
        p: (props) => <p className="mb-2" {...props} />,
        ul: (props) => <ul className="list-disc pl-5 mb-2" {...props} />,
        ol: (props) => <ol className="list-decimal pl-5 mb-2" {...props} />,
        li: (props) => <li className="mb-0.5" {...props} />,
        a: (props) => (
          <a className="text-blue-600 hover:underline" {...props} />
        ),
        blockquote: (props) => (
          <blockquote
            className="border-l-4 border-gray-300 pl-3 italic my-2 text-sm"
            {...props}
          />
        ),
        code: ({ inline, className, ...props }: CustomCodeProps) =>
          inline ? (
            <code
              className={`bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs ${
                className || ""
              }`}
              {...props}
            />
          ) : (
            <code
              className={`block bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-xs overflow-x-auto ${
                className || ""
              }`}
              {...props}
            />
          ),
        pre: (props) => (
          <pre
            className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-x-auto mb-2 text-xs"
            {...props}
          />
        ),
        strong: (props) => <strong className="font-bold" {...props} />,
        em: (props) => <em className="italic" {...props} />,
        hr: (props) => <hr className="my-3 border-gray-300" {...props} />,
        table: (props) => (
          <div className="overflow-x-auto mb-2">
            <table className="min-w-full border-collapse text-xs" {...props} />
          </div>
        ),
        thead: (props) => (
          <thead className="bg-gray-50 dark:bg-gray-700" {...props} />
        ),
        tbody: (props) => <tbody {...props} />,
        tr: (props) => (
          <tr
            className="border-b border-gray-200 dark:border-gray-700"
            {...props}
          />
        ),
        th: (props) => (
          <th className="px-2 py-1 text-left font-medium" {...props} />
        ),
        td: (props) => <td className="px-2 py-1" {...props} />,
      }}
      {...props}
      remarkPlugins={[remarkGfm]}
    >
      {children}
    </ReactMarkdown>
  );
}
