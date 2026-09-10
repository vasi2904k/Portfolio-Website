import NeuralNetwork from "@/components/neural/NeuralNetwork";
import { getPortfolioRepositories } from "@/data/repositories";

export const revalidate = 3600;

export default async function HomePage() {
  return <NeuralNetwork repos={await getPortfolioRepositories()} />;
}
