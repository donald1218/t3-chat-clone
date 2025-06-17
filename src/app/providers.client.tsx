import { QueryProvider } from "@/lib/query-provider";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "next-themes";

export default function ClientProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <JotaiProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </JotaiProvider>
    </QueryProvider>
  );
}
