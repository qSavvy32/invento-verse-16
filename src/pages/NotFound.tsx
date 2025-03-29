
import { AuthHeader } from "@/components/AuthHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-6xl font-bold mb-4 font-leonardo">404</h1>
        <p className="text-xl mb-8 text-center">
          Oops! The page you're looking for has gone missing.
        </p>
        <p className="mb-8 text-center text-muted-foreground">
          Perhaps it's being reinvented in another dimension.
        </p>
        <Button onClick={() => navigate("/")}>
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
