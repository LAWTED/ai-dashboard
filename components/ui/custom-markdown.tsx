'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ComponentPropsWithoutRef } from 'react';

interface CustomMarkdownProps extends ComponentPropsWithoutRef<typeof ReactMarkdown> {
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
          <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />
        ),
        h2: (props) => (
          <h2 className="text-xl font-semibold mb-3 mt-5" {...props} />
        ),
        h3: (props) => (
          <h3 className="text-lg font-medium mb-2 mt-4" {...props} />
        ),
        p: (props) => <p className="mb-3" {...props} />,
        ul: (props) => <ul className="list-disc pl-6 mb-4" {...props} />,
        ol: (props) => <ol className="list-decimal pl-6 mb-4" {...props} />,
        li: (props) => <li className="mb-1" {...props} />,
        a: (props) => (
          <a className="text-blue-600 hover:underline" {...props} />
        ),
        blockquote: (props) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
        ),
        code: ({ inline, className, ...props }: CustomCodeProps) =>
          inline ? (
            <code className={`bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm ${className || ''}`} {...props} />
          ) : (
            <code className={`block bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto ${className || ''}`} {...props} />
          ),
        pre: (props) => (
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto mb-4" {...props} />
        ),
        strong: (props) => <strong className="font-bold" {...props} />,
        em: (props) => <em className="italic" {...props} />,
        hr: (props) => <hr className="my-6 border-gray-300" {...props} />,
        table: (props) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border-collapse" {...props} />
          </div>
        ),
        thead: (props) => <thead className="bg-gray-50 dark:bg-gray-700" {...props} />,
        tbody: (props) => <tbody {...props} />,
        tr: (props) => <tr className="border-b border-gray-200 dark:border-gray-700" {...props} />,
        th: (props) => <th className="px-4 py-2 text-left font-medium" {...props} />,
        td: (props) => <td className="px-4 py-2" {...props} />,
      }}
      {...props}
    >
      {children}
    </ReactMarkdown>
  );
}