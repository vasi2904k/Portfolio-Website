import NeuralNetwork from "@/components/neural/NeuralNetwork";
import { getPortfolioRepositories } from "@/data/repositories";
export default async function HomePage() { return <NeuralNetwork repos={await getPortfolioRepositories()} />; }
