
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/app/layout/Header";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-16 md:pt-20 flex items-center justify-center bg-gradient-to-br from-brand-purple-light via-white to-brand-blue-light p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">{subtitle}</p>}
            </div>
            {children}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AuthLayout;
