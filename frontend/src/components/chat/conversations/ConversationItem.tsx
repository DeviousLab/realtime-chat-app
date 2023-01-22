import { Stack, Text } from "@chakra-ui/react"
import { ConversationPopulated } from "../../../../../backend/src/util/types"

type ConversationItemProps = {
  conversation: ConversationPopulated
}

const ConversationItem = ({ conversation }: ConversationItemProps) => {
  return (
    <Stack p={4} _hover={{ bg: "whiteAlpha.200" }}>
      <Text>
        {conversation.id}
      </Text>
    </Stack>
  )
}

export default ConversationItem