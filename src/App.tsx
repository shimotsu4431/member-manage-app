import {
  Avatar,
  Box,
  // Button,
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
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { API_BASE_URL, API_KEY } from "../config/microcms.ts"
import { Data, Style, SwrResponse, Member } from "../types"

dayjs.extend(utc)
dayjs.extend(timezone)

const microcmsPostData = (data: Data) => {
  window.parent.postMessage(
    {
      ...data,
      action: "MICROCMS_POST_DATA",
    },
    import.meta.env.VITE_MICROCMS_ORIGIN
  )
}

const microcmsUpdateStyle = (style: Style) => {
  window.parent.postMessage(
    {
      ...style,
      action: "MICROCMS_UPDATE_STYLE",
    },
    import.meta.env.VITE_MICROCMS_ORIGIN
  )
}

const useMicroCMSData = (endpoint: string): SwrResponse => {
  const fetcher = async (url: string) => {
    const response = await axios.get(url, {
      headers: {
        "X-API-KEY": API_KEY,
      },
    })
    return response.data
  }

  const { data, error } = useSWR(`${API_BASE_URL}/${endpoint}`, fetcher)

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}

function App() {
  const params =
    "?fields=id%2Cname%2Cage%2Cemail%2Cjoined%2Cdepartment%2CiconUrl&limit=100"
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
            height: 300,
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
          description: item ? `${item.department} Dept.` : "",
          imageUrl: item ? item.iconUrl : undefined,
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

  console.log("===================")
  console.log(import.meta.env.VITE_MICROCMS_ORIGIN)

  return (
    <>
      <ToastContainer autoClose={1200} />
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Box
          sx={{
            padding: "8px",
            border: "1px solid #eee",
            borderRadius: 4,
          }}
        >
          <Stack>
            <Box>
              <Box>
                {selectedMember ? (
                  <>
                    <DataTable
                      sx={{
                        padding: "4px",
                        border: "1px solid #563bff",
                        borderRadius: 4,
                      }}
                      columns={[
                        {
                          accessor: "name",
                          render: (record) => (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Avatar
                                mr={8}
                                radius="xl"
                                src={record.iconUrl}
                              ></Avatar>
                              <Text>{record.name}</Text>
                            </Box>
                          ),
                        },
                        {
                          accessor: "department",
                        },
                        { accessor: "email" },
                        { accessor: "age" },
                        {
                          accessor: "joined",
                          render: (record) =>
                            dayjs
                              .utc(record.joined)
                              .tz("Asia/Tokyo")
                              .format("YYYY/MM/DD"),
                        },
                      ]}
                      records={selectedMember}
                    />
                    {/* <Button
                      mt={4}
                      variant="outline"
                      color="dark"
                      size="xs"
                      onClick={() => {
                        setSelectedMember(null)
                        submitData(null)
                        toast.dismiss()
                        toast.success("success clear member!")
                      }}
                    >
                      Clear
                    </Button> */}
                  </>
                ) : (
                  <Text>Please select an author from the list below.</Text>
                )}
              </Box>
            </Box>
            <Divider />
            <Box>
              <Title order={2} size="h4">
                Member List
              </Title>
              {records && records.length >= 1 ? (
                <>
                  <DataTable
                    highlightOnHover
                    columns={[
                      {
                        accessor: "index",
                        title: "#",
                        textAlignment: "right",
                        width: 40,
                        render: (record) =>
                          records && records.indexOf(record) + 1,
                      },
                      {
                        accessor: "name",
                        sortable: true,
                        render: (record) => (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Avatar
                              mr={8}
                              radius="xl"
                              src={record.iconUrl}
                            ></Avatar>
                            <Text>{record.name}</Text>
                          </Box>
                        ),
                      },
                      {
                        accessor: "department",
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
                      const arr = []
                      arr.push(item)
                      setSelectedMember(arr)
                      submitData(item)
                      toast.dismiss()
                      toast.success("success select Author!")
                    }}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                  />
                </>
              ) : (
                <>
                  <Text>There are no members in the member list.</Text>
                </>
              )}
            </Box>
          </Stack>
        </Box>
      </MantineProvider>
    </>
  )
}

export default App
