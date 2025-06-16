import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountTab from "./account";
import BYOKTab from "./byok";

export default function CustomizationPage() {
  return (
    <Tabs>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="byok">BYOK</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <AccountTab />
      </TabsContent>

      <TabsContent value="byok">
        <BYOKTab />
      </TabsContent>
    </Tabs>
  );
}
