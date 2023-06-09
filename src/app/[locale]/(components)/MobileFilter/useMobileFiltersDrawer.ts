import { useBreakpointValue } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { RefinementListProps } from "react-instantsearch-hooks-web/dist/es/ui/RefinementList";

export default function useMobileFiltersDrawer(
  filtersItems: RefinementListProps["items"],
  selectedMonth: string
) {
  const [isFilterOpen, setFilterOpen] = useState(false);
  const onClose = useCallback(() => setFilterOpen(false), []);
  const onOpen = useCallback(() => setFilterOpen(true), []);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  let filtersCount = useMemo(() => {
    return filtersItems.reduce((acc, curr) => {
      return acc + (curr.isRefined ? 1 : 0);
    }, 0);
  }, [filtersItems]);

  if (selectedMonth) {
    filtersCount += 1;
  }

  return {
    isOpen: isMobile ? isFilterOpen : false,
    filtersCount,
    onClose,
    onOpen,
  };
}
