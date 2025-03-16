import {
  Attachments,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  Welcome,
  useXAgent,
  useXChat,
  XStream
} from '@ant-design/x';
import type { BubbleProps } from '@ant-design/x';
import { createStyles } from 'antd-style';
import React, { useEffect } from 'react';

import {
  CloudUploadOutlined,
  CommentOutlined,
  EllipsisOutlined,
  FireOutlined,
  HeartOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReadOutlined,
  ShareAltOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { Badge, Button, type GetProp, Space,Typography  } from 'antd';
import axios from 'axios';
import markdownit from 'markdown-it';
import {newConversation_post, streamRequest,pullSentences} from '@/services/ant-design-pro/api';
import {promise} from "@umijs/utils/compiled/zod";


const renderTitle = (icon: React.ReactElement, title: string) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);

// const defaultConversationsItems = [
//   {
//     key: '0',
//     label: 'What is Ant Design X?',
//   },
//       {
//     key: '01',
//     label: 'asdwdasdw?',
//   },
// ];

const defaultConversationsItems = await pullSentences()

console.log('defaultConversationsItems',defaultConversationsItems)

const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      min-width: 100%;
      height: 722px;
      border-radius: ${token.borderRadius}px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      .ant-prompts {
        color: ${token.colorText};
      }
    `,
    menu: css`
      background: ${token.colorBgLayout}80;
      width: 280px;
      height: 100%;
      min-width: 0%;
      display: flow;
      flex-direction: column;
    `,
    conversations: css`
      padding: 0 12px;
      flex: 1;
      overflow-y: auto;
    `,
    chat: css`
      height: 100%;
      width: 100%;
      //max-width: 700px;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${token.paddingLG}px;
      gap: 16px;
    `,
    messages: css`
      flex: 1;
    `,
    placeholder: css`
      padding-top: 32px;
      display: flex;
    `,
    sender: css`
      box-shadow: ${token.boxShadow};
    `,
    logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
        display: inline-block;
      }

      span {
        display: inline-block;
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
    addBtn: css`
      background: #1677ff0f;
      border: 1px solid #1677ff34;
      width: calc(100% - 24px);
      margin: 0 12px 24px 12px;
    `,
  };
});

const placeholderPromptsItems: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, 'Hot Topics'),
    description: 'What are you interested in?',
    children: [
      {
        key: '1-1',
        description: `What's new in X?`,
      },
      {
        key: '1-2',
        description: `What's AGI?`,
      },
      {
        key: '1-3',
        description: `Where is the doc?`,
      },
    ],
  },
  {
    key: '2',
    label: renderTitle(<ReadOutlined style={{ color: '#1890FF' }} />, 'Design Guide'),
    description: 'How to design a good product?',
    children: [
      {
        key: '2-1',
        icon: <HeartOutlined />,
        description: `Know the well`,
      },
      {
        key: '2-2',
        icon: <SmileOutlined />,
        description: `Set the AI role`,
      },
      {
        key: '2-3',
        icon: <CommentOutlined />,
        description: `Express the feeling`,
      },
    ],
  },
];

const senderPromptsItems: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    description: 'Hot Topics',
    icon: <FireOutlined style={{ color: '#FF4D4F' }} />,
  },
  {
    key: '2',
    description: 'Design Guide',
    icon: <ReadOutlined style={{ color: '#1890FF' }} />,
  },
];

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    // typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: 16,
      },
    },
  },
  local: {
    placement: 'end',
    variant: 'shadow',
  },
};


const md = markdownit({ html: true, breaks: true });
const renderMarkdown: BubbleProps['messageRender'] = (content) => (
  <Typography>
    {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
    <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
  </Typography>
);

const Independent: React.FC = () => {
  // ==================== Style ====================
  const { styles } = useStyle();

  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = React.useState(false);
  
  const [onloading, setOnloading] = React.useState(true);

  const [content, setContent] = React.useState('');

  const [conversationsItems, setConversationsItems] = React.useState(defaultConversationsItems.data);

  const [activeKey, setActiveKey] = React.useState("new"?defaultConversationsItems.data.length===0:defaultConversationsItems[0].key);

  const [attachedFiles, setAttachedFiles] = React.useState<GetProp<typeof Attachments, 'items'>>(
    [],
  );

  // ==================== Runtime ====================
  const [agent] = useXAgent({
    request: async (
        info,
        callbacks
    ) => {
      const { messages, message } = info;
      const { onSuccess, onUpdate, onError } = callbacks;


      // console.log('message', message);
      // console.log('messages', messages);

      // 使用 split() 方法按 "#-#" 分割字符串
      const parts = message.toString().split("#-#");

      // 提取 activeKey 和 nextContent
      const activeKey = parts[0];
      const content_msg = parts[1];


      let content = '';

      try {
        const response = await streamRequest(content_msg,activeKey);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }


        const reader = response?.body.getReader();
        const decoder = new TextDecoder('utf-8');

        // for await (const data of XStream({
        //   readableStream: response.body,
        // })) {
        //   console.log(11415154,data);
        //   // onUpdate(data);
        //
        // }

        while (true) {
          const { done, value } = await reader.read();
          // console.log(value)

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n').filter(line => line.startsWith('data: ') && line.length > 6);

          // console.log('start:',chunk)

          lines.forEach(line => {
            const deltaContent = line.slice(6) || '';
            content += deltaContent;
            onUpdate(content);
          });

          // console.log('end:',chunk)
        }

        onSuccess(content);
      } catch (error) {
        console.error('Error:', error);
        // onError(error);
      }
    },
  });



  // const [agent] = useXAgent({
  //   request: async ({ message }, { onSuccess, onUpdate }) => {
  //     const fullContent = `Streaming output instead of Bubble typing effect. You typed: ${message}`;
  //     let currentContent = '';
  //     onUpdate(currentContent);
  //
  //     const id = setInterval(() => {
  //       currentContent = fullContent.slice(0, currentContent.length + 2);
  //       onUpdate(currentContent);
  //
  //       if (currentContent === fullContent) {
  //         clearInterval(id);
  //         onSuccess(fullContent);
  //       }
  //     }, 100);
  //   },
  // });


  const { onRequest, messages, setMessages } = useXChat({
    agent,
  });
  

  useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
    }
  }, [activeKey]);

  // ==================== Event ====================
  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    onRequest(`${activeKey}#-#${nextContent}`);
    setContent('');
  };

  const onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'> = (info) => {
    // console.log('nextContent',info.data.description as string)
    onRequest(`${activeKey}#-#${info.data.description as string}`);
  };

  const onAddConversation = async () => {
    const response = await newConversation_post();
    const new_con_uuid:string = response.new_con_uuid.toString()
    console.log(new_con_uuid)
    if (!conversationsItems.some(item => item.key === new_con_uuid)){
        setConversationsItems([
          {
            key: new_con_uuid,
            label: `New Conversation ${new_con_uuid}`,
          },
          ...conversationsItems,
      ]);
    };

    setActiveKey(new_con_uuid);
    console.log(activeKey)
  };

  const onConversationClick: GetProp<typeof Conversations, 'onActiveChange'> = async (key) => {
    setActiveKey(key);
    let res = await pullSentences(Number(key))
    setMessages(res.data[0].sentences)
  };


  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) =>
    setAttachedFiles(info.fileList);

  if (conversationsItems.length===0) {
    // 如果对话列表是空的 就自动创建一个新的对话
    onAddConversation()
  }

  // ==================== Nodes ====================
  const placeholderNode = (
    <Space direction="vertical" size="middle" className={styles.placeholder}>
      <Welcome
        variant="borderless"
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="Hello, I'm Ant Design X"
        description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
        extra={
          <Space>
            <Button icon={<ShareAltOutlined />} />
            <Button icon={<EllipsisOutlined />} />
          </Space>
        }
      />
      <Prompts
        title="Do you want?"
        items={placeholderPromptsItems}
        styles={{
          list: {
            width: '100%',
          },
          item: {
            flex: 1,
          },
        }}
        onItemClick={onPromptsItemClick}
      />
    </Space>
  );

  const items: GetProp<typeof Bubble.List, 'items'> = messages.map(({ id, message, status }) => ({
    key: id,
    loading: message.length==0,
    role: status === 'local' ? 'local' : 'ai',
    content: message.toString().split("#-#")[1]?message.toString().split("#-#")[1]:message,
    messageRender: renderMarkdown
  }));

  const attachmentsNode = (
    <Badge dot={attachedFiles.length > 0 && !headerOpen}>
      <Button type="text" icon={<PaperClipOutlined />} onClick={() => setHeaderOpen(!headerOpen)} />
    </Badge>
  );

  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={headerOpen}
      onOpenChange={setHeaderOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={handleFileChange}
        placeholder={(type) =>
          type === 'drop'
            ? { title: 'Drop file here' }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload',
              }
        }
      />
    </Sender.Header>
  );

  const logoNode = (
    <div className={styles.logo}>
      {/*<img*/}
      {/*  src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"*/}
      {/*  draggable={false}*/}
      {/*  alt="logo"*/}
      {/*/>*/}
      {/*<span>Ant Design X</span>*/}
    </div>
  );

    // ==================== Render =================
  return (
    <div className={styles.layout}>
      <div className={styles.menu}>
        {/* 🌟 Logo */}
        {logoNode}
        {/* 🌟 添加会话 */}
        <Button
          onClick={onAddConversation}
          type="link"
          className={styles.addBtn}
          icon={<PlusOutlined />}
        >
          New Conversation
        </Button>
        {/* 🌟 会话管理 */}
        <Conversations
          items={conversationsItems}
          className={styles.conversations}
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </div>
      <div className={styles.chat}>
        {/* 🌟 消息列表 */}
        <Bubble.List
          items={items.length > 0 ? items : [{ content: placeholderNode, variant: 'borderless' }]}
          roles={roles}
          className={styles.messages}


        />
        {/* 🌟 提示词 */}
        <Prompts items={senderPromptsItems} onItemClick={onPromptsItemClick} />
        {/* 🌟 输入框 */}
        <Sender
          value={content}
          header={senderHeader}
          onSubmit={onSubmit}
          onChange={setContent}
          prefix={attachmentsNode}
          loading={agent.isRequesting()}
          className={styles.sender}
        />
      </div>
    </div>
  );
};

export default Independent;