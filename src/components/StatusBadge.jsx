const DOT = {
  waiting: "#d97706",
  serving: "#16a34a",
  done: "#9ca3af",
  skipped: "#dc2626",
};

const config = {
  waiting: { label: "Đang chờ", cls: "badge badge-waiting" },
  serving: { label: "Đang cắt", cls: "badge badge-serving" },
  done: { label: "Hoàn tất", cls: "badge badge-done" },
  skipped: { label: "Bỏ qua", cls: "badge badge-skipped" },
};

export default function StatusBadge({ status }) {
  const { label, cls } = config[status] || config.waiting;
  return (
    <span className={cls}>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: DOT[status] || DOT.waiting,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}
