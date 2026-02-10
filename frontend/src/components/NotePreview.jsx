import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function NotePreview({ content = '' }) {
  return (
    <div className="prose max-w-none text-slate-700 dark:text-slate-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children }) {
            return (
              <pre className="rounded-2xl bg-slate-900/95 p-4 text-sm text-slate-100 shadow-lg shadow-slate-900/20">
                {children}
              </pre>
            );
          },
          code({ inline, className, children, ...props }) {
            if (inline) {
              return (
                <code
                  className="rounded bg-slate-100 px-1 py-0.5 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content || 'Start writing to preview your markdown.'}
      </ReactMarkdown>
    </div>
  );
}
