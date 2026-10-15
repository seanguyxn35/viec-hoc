import Icon from "./Icon";

type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="flex min-h-[220px] flex-col items-center justify-center rounded-xl bg-surface-container-lowest p-space-lg text-center shadow-sm">
      <div className="mb-space-sm flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary">
        <Icon name="menu_book" size={28} />
      </div>
      <h3 className="text-title-md text-on-surface">{title}</h3>
      <p className="mt-space-xs text-body-sm text-on-surface-variant">
        {description}
      </p>
    </section>
  );
}
