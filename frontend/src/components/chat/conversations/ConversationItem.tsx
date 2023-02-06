import {
  Avatar,
  Box,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import enGB from "date-fns/locale/en-GB";
import React, { useState } from "react";
import { GoPrimitiveDot } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import { AiOutlineEdit } from "react-icons/ai";

import { formatUsernames } from "../../../util/functions";
import { ConversationPopulated } from "../../../../../backend/src/util/types";

const formatRelativeLocale = {
  lastWeek: "eeee",
  yesterday: "'Yesterday",
  today: "p",
  other: "dd/MM/yy",
};

type ConversationItemProps = {
  conversation: ConversationPopulated;
  userId: string;
  onClick: () => void;
  hasSeenLatestMessage?: boolean;
  onDeleteConversation: (conversationId: string) => void;
  isSelected: boolean;
}

const ConversationItem = ({ conversation, userId, onClick, hasSeenLatestMessage, isSelected, onDeleteConversation }: ConversationItemProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (e.type === "click") {
      onClick();
    } else if (e.type === "contextmenu") {
      e.preventDefault();
      setMenuOpen(true);
    }
  };
  return (
    <Stack
      direction="row"
      align="center"
      justify="space-between"
      p={4}
      cursor="pointer"
      borderRadius={4}
      bg={isSelected ? "whiteAlpha.200" : "none"}
      _hover={{ bg: "whiteAlpha.200" }}
      onClick={handleClick}
      onContextMenu={handleClick}
      position="relative"
    >
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        <MenuList bg="#2d2d2d">
          <MenuItem
            icon={<MdDeleteOutline fontSize={20} />}
            onClick={(event) => {
              event.stopPropagation();
              onDeleteConversation(conversation.id);
            }}
            bg="#2d2d2d"
            _hover={{ bg: "whiteAlpha.300" }}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
      <Flex position="absolute" left="-6px">
        {hasSeenLatestMessage === false && (
          <GoPrimitiveDot size={20} color="#3D84F7" />
        )}
      </Flex>
      <Avatar />
      <Flex justify="space-between" width="80%" height="100%">
        <Flex direction="column" width="70%" height="100%">
          <Text
            fontWeight={600}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {formatUsernames(conversation.participants, userId)}
          </Text>
          {conversation.lastMessage && (
            <Box width="140%" maxWidth="360px">
              <Text
                color="whiteAlpha.700"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {conversation.lastMessage.content}
              </Text>
            </Box>
          )}
        </Flex>
        <Text
          color="whiteAlpha.700"
          textAlign="right"
          position="absolute"
          right={4}
        >
          {formatRelative(new Date(conversation.updatedAt), new Date(), {
            locale: {
              ...enGB,
              formatRelative: (token) =>
                formatRelativeLocale[
                  token as keyof typeof formatRelativeLocale
                ],
            },
          })}
        </Text>
      </Flex>
    </Stack>
  );
}

export default ConversationItem