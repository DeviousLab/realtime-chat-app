import { Box } from "@chakra-ui/react"
import { Session } from "next-auth"
import ConversationList from "./ConversationList"

type ConversationsWrapperProps = {
  session: Session
}

const ConversationsWrapper = ({ session }: ConversationsWrapperProps) => {
  return (
    <Box width={{ base: '100%', md: "25rem" }} bg="whiteAlpha.50" py={6} px={3}>
      <ConversationList session={session} />
    </Box>
  )
}

export default ConversationsWrapper