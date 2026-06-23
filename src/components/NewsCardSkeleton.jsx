export default function NewsCardSkeleton() {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 space-y-2 animate-pulse">
      <div className="flex items-center space-x-1.5">
        <div className="w-5 h-5 rounded-full bg-gray-200" />
        <div className="w-5 h-5 rounded-full bg-gray-200" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-5/6 bg-gray-200 rounded" />
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-3 w-4/5 bg-gray-200 rounded" />
      <div className="h-3 w-24 bg-gray-200 rounded" />
    </div>
  );
}
