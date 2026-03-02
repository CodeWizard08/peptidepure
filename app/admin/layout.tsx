export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div id="admin-root" style={{ padding: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--navy)' }}>
          Admin is only available in development mode.
        </h1>
      </div>
    );
  }

  return <div id="admin-root">{children}</div>;
}
