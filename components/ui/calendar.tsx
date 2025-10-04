"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-lg font-bold text-black",
        nav: "space-x-1 flex items-center",
        nav_button: "h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 p-0 flex items-center justify-center border-0",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-500 rounded-md w-9 font-normal text-sm",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:text-accent-foreground",
        day: "h-9 w-9 p-0 font-bold text-black hover:bg-gray-100 rounded-md transition-colors cursor-pointer",
        day_range_end: "day-range-end",
        day_selected: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600 rounded-md",
        day_today: "bg-gray-100 text-black",
        day_outside: "text-gray-400 opacity-50",
        day_disabled: "text-gray-300 opacity-50",
        day_range_middle: "bg-blue-100 text-blue-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className="h-4 w-4 text-gray-600" />
          }
          return <ChevronRight className="h-4 w-4 text-gray-600" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
