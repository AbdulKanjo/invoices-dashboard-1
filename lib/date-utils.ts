export function getDefaultDateRange() {
  const defaultDateFrom = new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().split("T")[0]
  const defaultDateTo = new Date().toISOString().split("T")[0]

  return {
    defaultDateFrom,
    defaultDateTo,
  }
}

export function getDateRangeFromParams(searchParams: { [key: string]: string | string[] | undefined }) {
  const { defaultDateFrom, defaultDateTo } = getDefaultDateRange()

  const dateFrom = typeof searchParams.from === "string" ? searchParams.from : defaultDateFrom
  const dateTo = typeof searchParams.to === "string" ? searchParams.to : defaultDateTo

  return {
    dateFrom,
    dateTo,
  }
}
