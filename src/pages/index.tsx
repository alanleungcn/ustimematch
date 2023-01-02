import { type NextPage } from "next";
import { useEffect, useState } from "react";
import Explorer from "@components/Explorer";
import Header from "@components/Header";
import WeekView from "@components/WeekView";

const Home: NextPage = () => {
  // Prevent loading persisted content by SSR
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <>
      <Header>
        {hydrated && (
          <>
            <Explorer />
            <WeekView />
          </>
        )}
      </Header>
    </>
  );
};

export default Home;
