import BgWords from "@/app/_components/BgWords";
import WordsScroll from "@/app/_components/WordsScroll";
import styles from "./page.module.css";

export default function Index() {
  return (
    <div className={styles.wrapper}>
      <BgWords />
      <div className="container mx-auto">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-medium leading-tight text-green-dark font-vollkorn">
              <span>HamletHub celebrates the </span>
              <WordsScroll />
            </h1>
            <p className="text-xl md:text-2xl font-medium text-gray-800 mt-4">
              that make our community great. <br />
              Be local. Discover your town.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}