import { Card, CardContent } from "@/components/ui/card";

const HomePage = () => {
  return (
    <div className="full mx-auto py-8 px-8">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">
            歡迎使用學生管理系統
          </h1>
          <p className="text-muted-foreground">
            請從上方導航欄選擇您要使用的功能。
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;