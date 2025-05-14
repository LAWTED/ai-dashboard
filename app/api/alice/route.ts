import { getPromptByName, getFileByName, supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

// 定义信息收集顺序
const INFO_COLLECTION_ORDER = [
  { field: "username", question: "你的名字是什么呀？" },
  { field: "degree_type", question: "你是申请PhD吗？还是Master呀？" },
  { field: "application_cycle", question: "你是什么时候打算申呢？" },
  {
    field: "specific_area",
    question:
      "你目前科研细分领域有定下来吗？你自己最感兴趣的area或者research keywords这样子～",
  },
  {
    field: "dream_advisors",
    question:
      "有没有什么你特别喜欢TA科研方向的教授呀～Like your dream advisor这样～",
  },
  {
    field: "dream_schools",
    question: "那选校方面你有什么偏好嘛？学校名气or地理位置什么的。",
  },
  { field: "prep", question: "你目前准备的情况是怎么样呀？" },
  {
    field: "resume_url",
    question:
      "方便把你目前的CV或者简历发来一份不～我看下可能可以更有针对性地帮到你，我们一起brainstorm下怎么申到好的PhD programs。",
  },
  {
    field: "challenge",
    question: "你目前自己有什么最迷茫/对于申PhD最担忧的点吗？",
  },
  {
    field: "letter_of_rec",
    question: "对了，之前忘记问，你目前推荐人找得怎么样啦？",
  },
  {
    field: "family_concern",
    question:
      "那目前你家里是怎么想的？支持你申PhD吗？或者说他们有什么顾虑是你需要去说服的吗？",
  },
  {
    field: "alternatives",
    question: "目前你有没有别的选项呀？如果不去读博的话，打算做什么呢？",
  },
  // 其他可能需要收集的信息
  { field: "current_school", question: "你目前在哪所学校就读呢？" },
  { field: "gpa", question: "你的GPA大概是多少呢？" },
  { field: "undergraduate_degree", question: "你本科是学什么专业的呢？" },
  { field: "master_degree", question: "你硕士是学什么专业的呢？" },
  { field: "how_many_research", question: "你有多少段研究经历呢？" },
  { field: "months_research", question: "你的研究经历总共有多长时间呢？" },
  {
    field: "big_name_research",
    question: "你有没有在知名实验室或者知名教授下做过研究呢？",
  },
  { field: "gender", question: "方便问一下你的性别吗？" },
];

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      conversationHistory = [],
      userid = "default_user",
      model = "gpt-4.1-2025-04-14",
    } = await req.json();

    // Use OpenAI client for all models
    const client = openai;
    console.log(`Using OpenAI client for model: ${model}`);

    // 获取提示词
    const promptData = await getPromptByName("alice");
    if (!promptData) {
      return NextResponse.json(
        { success: false, message: "无法获取 Alice 的提示词" },
        { status: 500 }
      );
    }

    // 获取用户信息，使用 userid 作为主键
    const { data: userData, error: userError } = await supabase
      .from("studentinfo")
      .select("*")
      .eq("userid", userid)
      .single();

    if (userError && userError.code !== "PGRST116") {
      console.error("获取用户数据错误:", userError);
      return NextResponse.json(
        { success: false, message: "获取用户数据时发生错误" },
        { status: 500 }
      );
    }
    console.log(userData, "userData");

    // 如果用户不存在，立即创建一条新记录
    let createdUserData = null;
    if (!userData) {
      console.log("未找到用户记录，立即创建初始记录");
      const { data: newUser, error: createError } = await supabase
        .from("studentinfo")
        .insert({ userid: userid })
        .select();

      if (createError) {
        console.error("创建初始用户记录失败:", createError);
      } else {
        console.log("成功创建初始用户记录:", newUser);
        createdUserData = newUser[0];
      }
    }

    // 使用已有数据或者新创建的数据
    const effectiveUserData = userData || createdUserData || { userid };

    // 准备对话历史
    const updatedConversationHistory = [...conversationHistory];

    // 添加用户数据到对话历史
    if (effectiveUserData) {
      const relevantUserData = Object.fromEntries(
        Object.entries(effectiveUserData).filter(
          ([key]) =>
            !["id", "created_at", "updated_at"].includes(key) &&
            effectiveUserData[key] !== null
        )
      );

      if (Object.keys(relevantUserData).length > 0) {
        // Use push to add messages at the end in the correct order
        // First add the assistant message with the tool call
        updatedConversationHistory.push({
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "student-info-tool-call",
              type: "function",
              function: {
                name: "get_student_info",
                arguments: JSON.stringify({}),
              },
            },
          ],
        });

        // Then add the tool response
        updatedConversationHistory.push({
          role: "tool",
          tool_call_id: "student-info-tool-call",
          name: "get_student_info",
          content: JSON.stringify(relevantUserData),
        });
      }
    }

    // 分析用户数据，找出缺失的字段
    const missingFields = [];
    const collectedFields = [];

    for (const field of INFO_COLLECTION_ORDER.map((item) => item.field)) {
      if (
        effectiveUserData[field] === undefined ||
        effectiveUserData[field] === null
      ) {
        missingFields.push(field);
      } else {
        collectedFields.push(field);
      }
    }

    // 确定下一个应该收集的字段
    const nextFieldToCollect =
      missingFields.length > 0 ? missingFields[0] : null;
    const nextQuestion = nextFieldToCollect
      ? INFO_COLLECTION_ORDER.find((item) => item.field === nextFieldToCollect)
          ?.question
      : null;

    // 第一个请求: 分析用户消息并更新数据库
    const firstResponse = await client.chat.completions.create({
      model: model,
      messages: [
        ...updatedConversationHistory,
        {
          role: "user",
          content: message,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "update_student_info",
            description: "更新学生申请相关信息的函数，当从对话中识别到任何申请相关信息时调用此函数。同一次对话中可能需要更新多个字段。",
            parameters: {
              type: "object",
              properties: {
                userid: {
                  type: "string",
                  description: "用户唯一标识符",
                },
                username: {
                  type: "string",
                  description: "学生的名字",
                  optional: true,
                },
                dream_schools: {
                  type: "array",
                  items: { type: "string" },
                  description: "学生想申请的学校列表",
                  optional: true,
                },
                degree_type: {
                  type: "string",
                  description: "学位类型，如PhD、Master",
                  optional: true,
                },
                application_cycle: {
                  type: "integer",
                  description: "学生将申请的年份，当前年份是2025年",
                  optional: true,
                },
                specific_area: {
                  type: "string",
                  description: "特定研究领域/方向",
                  optional: true,
                },
                dream_advisors: {
                  type: "string",
                  description: "想要合作的导师",
                  optional: true,
                },
                current_school: {
                  type: "string",
                  description: "当前就读学校",
                  optional: true,
                },
                gpa: {
                  type: "number",
                  description: "GPA成绩",
                  optional: true,
                },
                undergraduate_degree: {
                  type: "string",
                  description: "本科学位",
                  optional: true,
                },
                master_degree: {
                  type: "string",
                  description: "硕士学位",
                  optional: true,
                },
                gender: {
                  type: "string",
                  description: "性别",
                  optional: true,
                },
                prep: {
                  type: "string",
                  description: "申请准备情况",
                  optional: true,
                },
                resume_url: {
                  type: "string",
                  description: "简历链接",
                  optional: true,
                },
                challenge: {
                  type: "string",
                  description: "面临的挑战",
                  optional: true,
                },
                how_many_research: {
                  type: "integer",
                  description: "研究经历数量",
                  optional: true,
                },
                months_research: {
                  type: "integer",
                  description: "研究经历月数",
                  optional: true,
                },
                big_name_research: {
                  type: "boolean",
                  description: "是否有知名研究经历",
                  optional: true,
                },
                letter_of_rec: {
                  type: "string",
                  description: "推荐信情况",
                  optional: true,
                },
                family_concern: {
                  type: "string",
                  description: "家庭相关顾虑",
                  optional: true,
                },
                alternatives: {
                  type: "string",
                  description: "替代方案",
                  optional: true,
                },
              },
            },
          },
        },
      ],
      tool_choice: "required",
    });

    // 处理工具调用和数据库更新
    let updatedStudentInfo = null;
    let dbOperation = null;

    if (firstResponse.choices[0].message.tool_calls) {
      const toolCalls = firstResponse.choices[0].message.tool_calls;
      const functionCall = toolCalls[0];
      const functionName = functionCall.function.name;
      const functionArgs = JSON.parse(functionCall.function.arguments);

      if (functionName === "update_student_info") {
        // 添加 userid 到参数中（确保以接收到的userid为准）
        functionArgs.userid = userid;

        try {
          // 更新或创建用户信息，使用 userid 作为主键
          if (effectiveUserData) {
            // 更新用户信息
            const { data, error } = await supabase
              .from("studentinfo")
              .update(functionArgs)
              .eq("userid", userid)
              .select();

            if (error) throw error;

            updatedStudentInfo = data;
            dbOperation = "update";
            console.log("数据库更新结果:", data);
          }
        } catch (dbError) {
          console.error("数据库操作失败:", dbError);
        }
      }
    }

    // 第二个请求: 基于用户文本+用户信息生成回复
    try {
      // 获取Alice文件内容和向量存储ID
      const fileData = await getFileByName("alice");
      const fileContent = fileData?.content;

      // 创建扩展的系统提示词，包含信息收集状态和指导
      const extendedSystemPrompt = `
${promptData.content}

${fileContent ? `[Alice知识库]\n${fileContent}\n` : ""}

[信息收集状态]
已收集信息: ${
        collectedFields.length > 0
          ? collectedFields
              .map((field) => `${field}: ${effectiveUserData[field]}`)
              .join(", ")
          : "无"
      }
缺失信息: ${missingFields.join(", ") || "无"}
${
  nextFieldToCollect
    ? `下一个应收集的信息: ${nextFieldToCollect}
建议问题: ${nextQuestion}`
    : "所有必要信息已收集完毕"
}

[持续性提示]
你是一个引导式助手 - 请持续推进对话直至完成用户信息收集。只有在确信本轮所需信息已收集后才结束你的回合。

[规划提示]
在每次询问新信息之前，请先计划如何自然地引导对话。在收到用户回复后，请仔细分析内容并思考如何进行下一步信息收集。

[重要指示]
1. 对于值为null的字段，必须想办法收集。务必按照指定顺序收集信息。
2. 当前用户对话中应该优先收集${nextFieldToCollect || "剩余缺失信息"}。
3. 自然地引导用户提供信息，避免机械地询问。
4. 在收集完一个信息后，自然过渡到下一个需要收集的信息。
5. 确保你的回复符合提示词中的输出格式，使用反斜线(\\)分隔句子，控制长度在2-3句之间。
6. 如果用户表达兴趣点,优先共情 + 回应, 而不是立刻问下一个问题。
7. 每次只返回一个 assistant 消息, 不要返回多个 assistant 消息。

# 示例
## 自然引导示例
用户: "我对ML方向很感兴趣"
助手: "ML是个非常广阔的领域呢，从传统算法到深度学习都有很多精彩的研究方向。\\你对ML中的哪些具体方向更感兴趣呢？比如CV、NLP或者强化学习？"

## 信息收集示例
用户: "我目前在北大读本科"
助手: "北大是非常棒的学校，为你的求学经历点赞！\\你现在是大几呢？方便分享一下你的GPA情况吗？"
`;

      const secondRequestMessages = [
        ...conversationHistory,
        {
          role: "user",
          content: message,
        },
      ];

      // 准备请求配置
      const requestConfig = {
        model: model,
        instructions: extendedSystemPrompt,
        input: secondRequestMessages,
        temperature: 0.7, // 适度的创造性
      };

      // 发送请求
      const secondResponse = await client.responses.create(requestConfig);

      // 返回最终响应
      return NextResponse.json({
        success: true,
        response: secondResponse.output_text,
        studentInfo: updatedStudentInfo || effectiveUserData,
        db_operation: dbOperation,
        nextFieldToCollect,
        missingFields,
        collectedFields,
        model: model,
        file_content_used: fileContent ? true : false,
      });
    } catch (aiError) {
      console.error("AI响应获取失败:", aiError);
      return NextResponse.json(
        {
          success: false,
          message: "AI响应获取失败",
          error:
            aiError instanceof Error
              ? aiError.message
              : JSON.stringify(aiError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in Alice API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request",
        error: error instanceof Error ? error.message : JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
