// components/ProtectedRoute.tsx
import { useUserContext } from "@/context/GlobalContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loading from "../atomic/loading/Loading";

const ProtectedRoute = ({ Component }) => {
  const { user } = useUserContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading || !user) {
    return <Loading/>
  }

  return <Component />;
};

export default ProtectedRoute;
