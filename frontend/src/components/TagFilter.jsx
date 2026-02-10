export default function TagFilter({ tags = [], selectedTag, onSelectTag }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onSelectTag?.(null)}
        className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition ${
          selectedTag
            ? 'border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            : 'border-indigo-500/60 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400/70 dark:bg-indigo-400/20 dark:text-indigo-200'
        }`}
      >
        All
      </button>
      {tags.map((tag) => {
        const isActive =
          selectedTag &&
          (selectedTag.id === tag.id || selectedTag.name === tag.name);
        return (
          <button
            key={tag.id ?? tag.name}
            type="button"
            onClick={() => onSelectTag?.(tag)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition ${
              isActive
                ? 'text-white'
                : 'text-slate-600 hover:text-slate-800 dark:text-slate-200 dark:hover:text-white'
            }`}
            style={{
              borderColor: tag.color || '#6366f1',
              backgroundColor: isActive ? tag.color || '#6366f1' : 'transparent',
            }}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
