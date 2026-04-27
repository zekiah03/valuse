import type { CategoryResult } from "@/types";

interface Props {
  result: CategoryResult;
  rank: number;
}

export default function CategoryCard({ result, rank }: Props) {
  return (
    <div
      className="rounded-2xl p-5 border-2 bg-white shadow-sm"
      style={{ borderColor: result.color }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: result.color }}
          >
            {rank}
          </span>
          <span className="font-bold text-gray-800 text-lg">{result.label}価値観</span>
        </div>
        <span
          className="text-2xl font-extrabold"
          style={{ color: result.color }}
        >
          {result.score}
          <span className="text-sm font-normal text-gray-500">点</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-3">
        <div
          className="h-full rounded-full"
          style={{ width: `${result.score}%`, backgroundColor: result.color }}
        />
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{result.description}</p>
    </div>
  );
}
