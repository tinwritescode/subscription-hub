export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-ink [font-stretch:125%]">
      <span aria-hidden className="flex gap-0.5">
        <span className="size-2 rounded-full bg-ink" />
        <span className="size-2 rounded-full bg-ink" />
        <span className="size-2 rounded-full bg-coral" />
      </span>
      Subscription Hub
    </span>
  );
}
