import {
  Box,
  Button,
  Divider,
  MantineProvider,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import _ from "lodash"
import useSWR from "swr"
import axios from "axios"
import { DataTable, DataTableSortStatus } from "mantine-datatable"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

const API_KEY = "Bb5vrvSJWHjL9OuummJntT7E5QOHCUOpk2jp"
const BASE_URL = "https://uxszenfmbz.microcms.io/api/v1"

type swrResponse = {
  data: MemberResponse
  isLoading: boolean
  isError: boolean
}

const useMicroCMSData = (endpoint: string): swrResponse => {
  const fetcher = async (url: string) => {
    const response = await axios.get(url, {
      headers: {
        "X-API-KEY": API_KEY,
      },
    })
    return response.data
  }

  const { data, error } = useSWR(`${BASE_URL}/${endpoint}`, fetcher)

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}

type Member = {
  id: string
  name: string
  age: number
  email: string
  joined: string
  icon: {
    url: string
    height: number
    width: number
  }
  department: {
    id: string
    createdAt: string
    publishedAt: string
    revisedAt: string
    title: string
    updatedAt: string
  }
}

type MemberResponse = {
  limit: number
  offset: number
  totalCount: number
  contents: Member[]
}

function App() {
  const params =
    "?fields=id%2Cicon%2Cname%2Cage%2Cemail%2Cjoined%2Cdepartment.title"
  const { data, isLoading, isError } = useMicroCMSData(`members${params}`)

  const [selectedMember, setSelectedMember] = useState<Member[] | null>(null)

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "name",
    direction: "asc",
  })

  const [records, setRecords] = useState<Member[] | undefined>(undefined)

  useEffect(() => {
    setRecords(_.sortBy(data && data.contents, "name"))
  }, [data])

  useEffect(() => {
    const _data = _.sortBy(
      data && data.contents,
      sortStatus.columnAccessor
    ) as Member[]
    setRecords(sortStatus.direction === "desc" ? _data.reverse() : _data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortStatus])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error occurred.</div>
  }

  return (
    <>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Box>
          <Stack>
            <Box mt={20} h={180} mb={20}>
              <Title order={2}>Selected</Title>
              <Box mt={10}>
                {selectedMember ? (
                  <>
                    <DataTable
                      mt={20}
                      columns={[
                        { accessor: "name" },
                        {
                          accessor: "department",
                          render: (record) => record.department.title,
                          sortable: true,
                        },
                        { accessor: "email" },
                        { accessor: "age", sortable: true },
                        {
                          accessor: "joined",
                          render: (record) =>
                            dayjs
                              .utc(record.joined)
                              .tz("Asia/Tokyo")
                              .format("YYYY/MM/DD"),
                          sortable: true,
                        },
                      ]}
                      records={selectedMember}
                    />
                    <Button mt={10} onClick={() => setSelectedMember(null)}>
                      Clear
                    </Button>
                  </>
                ) : (
                  <Text>No one has been selected yet.</Text>
                )}
              </Box>
            </Box>
            <Divider />
            <Box mt={20}>
              <Title order={2}>Members</Title>
              <DataTable
                mt={20}
                highlightOnHover
                columns={[
                  {
                    accessor: "index",
                    title: "#",
                    textAlignment: "right",
                    width: 40,
                    render: (record) => records && records.indexOf(record) + 1,
                  },
                  { accessor: "name", sortable: true },
                  {
                    accessor: "department",
                    render: (record) => record.department.title,
                    sortable: true,
                  },
                  { accessor: "email" },
                  { accessor: "age", sortable: true },
                  {
                    accessor: "joined",
                    render: (record) =>
                      dayjs
                        .utc(record.joined)
                        .tz("Asia/Tokyo")
                        .format("YYYY/MM/DD"),
                    sortable: true,
                  },
                ]}
                records={records}
                onRowClick={(item) => {
                  console.log(item)

                  const arr = []
                  arr.push(item)
                  setSelectedMember(arr)
                }}
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus}
              />
            </Box>
          </Stack>
        </Box>
      </MantineProvider>
    </>
  )
}

export default App
