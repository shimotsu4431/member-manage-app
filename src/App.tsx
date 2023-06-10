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
import { useCallback, useEffect, useState } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

const API_KEY = "Bb5vrvSJWHjL9OuummJntT7E5QOHCUOpk2jp"
const BASE_URL = "https://uxszenfmbz.microcms.io/api/v1"

type Message = {
  id?: string // iFrame識別子
  title?: string
  description?: string
  imageUrl?: string
  updatedAt?: Date
  data: Member | null
}

type Data = {
  id: string
  message: Message
}

type StyleMessage = {
  height: number
}

type Style = {
  id: string
  message: StyleMessage
}

const microcmsPostData = (data: Data) => {
  window.parent.postMessage(
    {
      ...data,
      action: "MICROCMS_POST_DATA",
    },
    "https://uxszenfmbz.microcms.io"
  )
}

const microcmsUpdateStyle = (style: Style) => {
  window.parent.postMessage(
    {
      ...style,
      action: "MICROCMS_UPDATE_STYLE",
    },
    "https://uxszenfmbz.microcms.io"
  )
}

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

  const [id, setId] = useState<string>("")
  const [extData, setExtData] = useState<Member | null>(null)

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

  useEffect(() => {
    if (extData) {
      const arr = []
      arr.push(extData)
      setSelectedMember(arr)
    }
  }, [extData])

  useEffect(() => {
    window.addEventListener("message", (e) => {
      if (
        e.isTrusted === true &&
        e.data.action === "MICROCMS_GET_DEFAULT_DATA"
      ) {
        setId(e.data.id)
        setExtData(e.data.message?.data)
        microcmsUpdateStyle({
          id: e.data.id,
          message: {
            height: 240,
          },
        })
      }
    })
  }, [])

  const submitData = useCallback(
    (item: Member | null) => {
      setExtData(item)
      microcmsPostData({
        id,
        message: {
          title: item ? item.name : "",
          description: item ? item.email : "",
          data: item ? item : null,
        },
      })
    },
    [id]
  )

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
            <Box mt={20} h={150} mb={20}>
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
                    <Button
                      mt={10}
                      variant="outline"
                      color="dark"
                      size="xs"
                      onClick={() => {
                        setSelectedMember(null)
                        submitData(null)
                      }}
                    >
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

                  submitData(item)
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
