/**
 * Skeleton for /dashboard/* route transitions. Every dashboard page does
 * real Supabase queries (and the chatbot list additionally aggregates
 * message stats), so without this the sidebar sits on a blank pane while
 * they resolve.
 */
export default function DashboardLoading() {
  return (
    <>
      <div className="flex flex-shrink-0 flex-col gap-3 border-b border-[#F0F0EE] px-5 py-6 sm:px-10 sm:py-7">
        <div className="h-9 w-[280px] animate-pulse rounded-[8px] bg-[#F0F0EE]" />
        <div className="h-4 w-[380px] animate-pulse rounded-full bg-[#F4F4F3]" />
      </div>
      <div className="flex-1 px-5 py-6 sm:px-10 sm:py-7">
        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex animate-pulse flex-col gap-3.5 rounded-[16px] border border-[#E7E7E4] p-5"
            >
              <div className="flex items-center justify-between">
                <div className="h-[34px] w-[34px] rounded-[10px] bg-[#F0F0EE]" />
                <div className="h-[22px] w-[60px] rounded-full bg-[#F4F4F3]" />
              </div>
              <div className="h-5 w-[60%] rounded-full bg-[#F0F0EE]" />
              <div className="h-3.5 w-[40%] rounded-full bg-[#F4F4F3]" />
              <div className="mt-1 h-px bg-[#F0F0EE]" />
              <div className="flex gap-4">
                <div className="h-8 w-12 rounded-[6px] bg-[#F4F4F3]" />
                <div className="h-8 w-12 rounded-[6px] bg-[#F4F4F3]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
