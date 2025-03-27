
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DropdownNav } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [year, setYear] = React.useState<number>(() => {
    // Default to the selected date's year or current year
    return props.selected instanceof Date 
      ? props.selected.getFullYear() 
      : new Date().getFullYear();
  });

  const [month, setMonth] = React.useState<number>(() => {
    // Default to the selected date's month or current month
    return props.selected instanceof Date 
      ? props.selected.getMonth() 
      : new Date().getMonth();
  });

  // Update the displayed month/year when selection changes
  React.useEffect(() => {
    if (props.selected instanceof Date) {
      setYear(props.selected.getFullYear());
      setMonth(props.selected.getMonth());
    }
  }, [props.selected]);

  const handleYearChange = (selectedYear: string) => {
    setYear(parseInt(selectedYear));
  };

  const handleMonthChange = (selectedMonth: string) => {
    setMonth(parseInt(selectedMonth));
  };

  // Custom dropdown navigation
  const CustomDropdownNav: React.FC<{
    displayedMonth: Date;
    onMonthChange: (date: Date) => void;
  }> = ({ displayedMonth, onMonthChange }) => {
    const years = Array.from({ length: 50 }, (_, i) => (
      new Date().getFullYear() - 25 + i
    ));

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return (
      <div className="flex justify-center items-center space-x-2">
        <Select 
          value={month.toString()} 
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((monthName, index) => (
              <SelectItem key={monthName} value={index.toString()}>
                {monthName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={year.toString()} 
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-[80px] h-8 text-xs">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((yearNum) => (
              <SelectItem key={yearNum} value={yearNum.toString()}>
                {yearNum}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium hidden", // Hide the default caption
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth, currencyMonth, ...captionProps }) => (
          <CustomDropdownNav 
            displayedMonth={displayMonth} 
            onMonthChange={(date) => {
              captionProps.onMonthChange?.(date);
            }} 
          />
        ),
      }}
      month={new Date(year, month)}
      onMonthChange={(month) => {
        setMonth(month.getMonth());
        setYear(month.getFullYear());
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
