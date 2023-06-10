import {
  Box,
  Center,
  Divider,
  MantineProvider,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core"
import useSWR from "swr"
import axios from "axios"

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
  const params = "?fields=name%2Cicon%2Cage%2Cemail%2Cjoined%2Cdepartment"
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
              <Table mt={10} highlightOnHover={true}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Department</th>
                    <th>Joined Year</th>
                  </tr>
                </thead>
                <tbody>
                  {data.contents.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.age}</td>
                      <td>{item.department.title}</td>
                      <td>{item.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          </Stack>
        </Center>
      </MantineProvider>
    </>
  )
}

export default App
