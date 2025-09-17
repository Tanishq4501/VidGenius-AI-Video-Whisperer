import Hero from "../components/hero";
import Features from "../components/features";
import Explanation from "../components/explanation";
import Demosec from "../components/demosec";
import Targetusr from "../components/targetusr";
import Pricing from "../components/pricing";
import Cta from "../components/cta";
import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";

export default async function Home() {
    const {userId} = await auth();

    if (userId) {
        redirect('/upload');
    }

  return (
    <>
      <Hero/>
      <Features/>
      <Explanation/>
      <Demosec/>
      <Targetusr/>
      <Pricing/>
      <Cta/>
    </>
  );
}
