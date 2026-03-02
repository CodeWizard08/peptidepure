interface TrustBarItem {
  icon: string;
  text: string;
}

export default function MarqueeTrustBar({ items }: { items: TrustBarItem[] }) {
  return (
    <div
      className="overflow-hidden py-4 border-y"
      style={{ background: 'var(--navy)', borderColor: 'rgba(200,149,44,0.2)' }}
    >
      <div className="flex animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2.5 mx-8 text-sm font-medium text-gray-300">
            <span style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>{item.icon}</span>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
