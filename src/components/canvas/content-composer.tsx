"use client";

import { useToast } from "@/hooks/use-toast";
import {
  convertLangchainMessages,
  convertToOpenAIFormat,
} from "@/lib/convert_messages";
import { ProgrammingLanguageOptions } from "@/types";
import {
  AppendMessage,
  AssistantRuntimeProvider,
  useExternalMessageConverter,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Thread as ThreadType } from "@langchain/langgraph-sdk";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Toaster } from "../ui/toaster";
import { Thread } from "@/components/chat-interface";
import { useGraphContext } from "@/contexts/GraphContext";

export interface ContentComposerChatInterfaceProps {
  switchSelectedThreadCallback: (thread: ThreadType) => void;
  setChatStarted: React.Dispatch<React.SetStateAction<boolean>>;
  hasChatStarted: boolean;
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
}
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

export function ContentComposerChatInterfaceComponent(
  props: ContentComposerChatInterfaceProps
): React.ReactElement {
  const { toast } = useToast();
  const { userData, graphData, threadData } = useGraphContext();
  const { messages, setMessages, streamMessage } = graphData;
  const { getUserThreads } = threadData;
  const [isRunning, setIsRunning] = useState(false);

  async function onNew(message: AppendMessage): Promise<void> {
    let cleanedhtml = "";

    // get cookie file_ids
    const fileIds = getCookie("file_ids");
    if (fileIds) {
      // giải mã utf-8 
      const decodedFileIds = decodeURIComponent(fileIds);
      console.log('decodedFileIds:', decodedFileIds);
      try {
        const fileIds = [decodedFileIds];
        console.log('Selected file ID:', fileIds);
   
        const response = await fetch('http://localhost:5006/getfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ file_ids: fileIds })
        });
   
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          console.log('Cleaned HTML:', data.cleaned_html);
          cleanedhtml = data.cleaned_html;
        } else {
          const errorData = await response.json();
          console.error('API Error:', errorData.error || 'Không xác định');
        }
      } catch (error) {
        console.error('Error details:', error);
      }
    }

    console.log('onNew called with message:', message);
    
    if (!userData.user) {
      console.log('No user found');
      toast({
        title: "User not found", 
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const messageText = message.content.find(
      (part) => part.type === "text"
    )?.text;
    console.log('Extracted message text:', messageText);

    console.log('message in onNew:', message);

    if (!messageText) {
      console.log('No text content found in message');
      toast({
        title: "Only text messages are supported",
        variant: "destructive", 
        duration: 5000,
      });
      return;
    }

    props.setChatStarted(true);
    setIsRunning(true);

    try {
      const humanMessage = new HumanMessage({
        content: messageText,
        id: uuidv4(),
      });
      console.log('Created human message:', humanMessage);

      setMessages((prevMessages) => [...prevMessages, humanMessage]);
      const convertedMessage = convertToOpenAIFormat(humanMessage);
      console.log('Converted message format:', convertedMessage);
      
      if (cleanedhtml) {
        console.log('Found cleaned HTML:', cleanedhtml);
        convertedMessage.content = `${cleanedhtml}\n\n${messageText}`;
      } else {
        convertedMessage.content = `Hãy gọi tôi là Phương\n\n${messageText}`;
      }
      console.log('Final message to stream:', convertedMessage);

      await streamMessage({
        messages: [convertedMessage],
      });
    } catch (error) {
      console.error('Error in onNew:', error);
    } finally {
      setIsRunning(false);
      await getUserThreads(userData.user.id);
    }
  }

  const threadMessages = useExternalMessageConverter<BaseMessage>({
    callback: convertLangchainMessages,
    messages: messages,
    isRunning,
  });

  const runtime = useExternalStoreRuntime({
    messages: threadMessages,
    isRunning,
    onNew,
  });

  return (
    <div className="h-full">
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread
          setChatStarted={props.setChatStarted}
          handleQuickStart={props.handleQuickStart}
          hasChatStarted={props.hasChatStarted}
          switchSelectedThreadCallback={props.switchSelectedThreadCallback}
        />
      </AssistantRuntimeProvider>
      <Toaster />
    </div>
  );
}

export const ContentComposerChatInterface = React.memo(
  ContentComposerChatInterfaceComponent
);
