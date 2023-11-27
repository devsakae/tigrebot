import { Fragment } from "react";
import Header from "./Components/Header";

export default function Home() {
  return (
    <Fragment>
      <Header />
      <main className="pt-10">
        <h2>Tigrebot</h2>
      </main>
    </Fragment>
  )
}
