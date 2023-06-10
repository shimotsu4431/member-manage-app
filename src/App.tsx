import {
  Box,
  Center,
  Divider,
  MantineProvider,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import useSWR from "swr"
import axios from "axios"
import { DataTable } from "mantine-datatable"

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
  const params = "?fields=id%2Cname%2Cage%2Cemail%2Cjoined%2Cdepartment.title"
  const { data, isLoading, isError } = useMicroCMSData(`members${params}`)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error occurred.</div>
  }

  return (
    <>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Center maw={800} mx="auto">
          <Stack>
            <Box mt={20} h={100}>
              <Title order={2}>Selected</Title>
              <Box mt={10}>
                <Text>No one has been selected yet.</Text>
              </Box>
            </Box>
            <Divider />
            <Box mt={20}>
              <Title order={2}>Members</Title>
              <DataTable
                mt={20}
                highlightOnHover
                columns={[
                  { accessor: "name" },
                  { accessor: "department.title" },
                  { accessor: "email" },
                  { accessor: "age" },
                  { accessor: "joined" },
                ]}
                records={data.contents}
                onRowClick={(item) => {
                  console.log(item)
                }}
              />
            </Box>
          </Stack>
        </Center>
      </MantineProvider>
    </>
  )
}

export default App
