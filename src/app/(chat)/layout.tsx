export default function ChatLayout({
  children,
  customization,
}: {
  children: React.ReactNode;
  customization: React.ReactNode;
}) {
  return (
    <>
      {children}
      {customization}
    </>
  );
}
