import { Skeleton } from "@/components/ui/skeleton"


function loading() {
  return (
    <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
            <div className="bg-card p-6 rounded-lg">
                <div className="flex flex-col items-center text-center border p-3">
                    <Skeleton className="w-24 h-24 rounded-full" />
                    <Skeleton className="mt-4 h-6 w-1/2" />
                    <Skeleton className="mt-2 h-4 w-1/3" />
                    <Skeleton className="mt-2 h-4 w-3/4" />

                    {/* PROFILE STATS */}
                    <div className="w-full mt-6">
                        <div className="flex justify-between mb-4">
                            <div className="flex-1 text-center">
                                <Skeleton className="h-5 w-10 mx-auto" />
                                <Skeleton className="mt-2 h-4 w-16 mx-auto" />
                            </div>
                            <div className="flex-1 text-center">
                                <Skeleton className="h-5 w-10 mx-auto" />
                                <Skeleton className="mt-2 h-4 w-16 mx-auto" />
                            </div>
                            <div className="flex-1 text-center">
                                <Skeleton className="h-5 w-10 mx-auto" />
                                <Skeleton className="mt-2 h-4 w-16 mx-auto" />
                            </div>
                        </div>
                    </div>

                    {/* "FOLLOW & EDIT PROFILE" BUTTONS */}
                    <Skeleton className="w-full h-10 mt-4" />

                    {/* LOCATION & WEBSITE */}
                    <div className="flex justify-start w-full mt-6 space-y-2">
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                    </div>
                </div>
            </div>
        </div>

        <div className="w-full">
            <div className="flex space-x-4 border-b p-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            </div>
            <div className="mt-6 space-y-6">
            {[...Array(3)].map((_, index) => (
                <div key={index} className="p-4 border rounded-lg">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                </div>
            ))}
            </div>
        </div>
        </div>
    </div>
  )
}

export default loading
