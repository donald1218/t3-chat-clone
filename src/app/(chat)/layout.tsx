export default function ChatLayout({
  children,
  customization,
  voice,
}: {
  children: React.ReactNode;
  customization: React.ReactNode;
  voice: React.ReactNode;
}) {
  return (
    <>
      {children}
      {customization}
      {voice}
    </>
  );
}
