import { getPromptByName, supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { deepseek } from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [], username = "Lawted" } = await req.json();

    // 从数据库获取用户信息
    const { data: userData, error: userError } = await supabase
      .from("studentinfo")
      .select("*")
      .eq("username", username)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error("获取用户数据错误:", userError);
      return NextResponse.json(
        { success: false, message: "获取用户数据时发生错误" },
        { status: 500 }
      );
    }
    console.log(userData, "userData");

    // 从数据库获取 alice 提示词
    const promptData = await getPromptByName("alice");

    if (!promptData) {
      return NextResponse.json(
        { success: false, message: "无法获取 Alice 的提示词" },
        { status: 500 }
      );
    }

    // 准备对话历史
    const updatedConversationHistory = [...conversationHistory];

    // 如果有用户数据，添加为工具消息
    if (userData) {
      // 过滤掉不需要的字段
      const relevantUserData = Object.fromEntries(
        Object.entries(userData).filter(([key]) =>
          !['id', 'created_at', 'updated_at'].includes(key) && userData[key] !== null
        )
      );

      // 添加工具消息到历史
      if (Object.keys(relevantUserData).length > 0) {
        // 正确的顺序：1. 助手发送带有工具调用的消息，2. 工具响应
        // 因为使用unshift添加到数组开头，所以顺序要反过来
        updatedConversationHistory.unshift({
          role: "tool",
          tool_call_id: "student-info-tool-call",
          name: "get_student_info",
          content: JSON.stringify({ success: true, message: "已获取学生信息" })
        });

        updatedConversationHistory.unshift({
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "student-info-tool-call",
              type: "function",
              function: {
                name: "get_student_info",
                arguments: JSON.stringify(relevantUserData)
              }
            }
          ]
        });
      }
    }

    // 使用 deepseek API
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: promptData.content,
        },
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
            description:
              "更新学生信息的函数, 当学生提到任何自身申请相关信息时，如梦想学校、专业方向、GPA、本科学校、硕士学校、性别、梦想导师、当前就读学校、申请年份、特定研究领域/方向等，调用此函数",
            parameters: {
              type: "object",
              properties: {
                dream_schools: {
                  type: "array",
                  items: { type: "string" },
                  description: "学生想申请的学校列表",
                  optional: true
                },
                degree_type: {
                  type: "string",
                  description: "学位类型，如PhD、Master",
                  optional: true
                },
                application_cycle: {
                  type: "integer",
                  description: "申请年份",
                  optional: true
                },
                specific_area: {
                  type: "string",
                  description: "特定研究领域/方向",
                  optional: true
                },
                dream_advisors: {
                  type: "string",
                  description: "想要合作的导师",
                  optional: true
                },
                current_school: {
                  type: "string",
                  description: "当前就读学校",
                  optional: true
                },
                gpa: {
                  type: "number",
                  description: "GPA成绩",
                  optional: true
                },
                undergraduate_degree: {
                  type: "string",
                  description: "本科学位",
                  optional: true
                },
                master_degree: {
                  type: "string",
                  description: "硕士学位",
                  optional: true
                },
                gender: {
                  type: "string",
                  description: "性别",
                  optional: true
                },
                prep: {
                  type: "string",
                  description: "申请准备情况",
                  optional: true
                },
                resume_url: {
                  type: "string",
                  description: "简历链接",
                  optional: true
                },
                challenge: {
                  type: "string",
                  description: "面临的挑战",
                  optional: true
                },
                how_many_research: {
                  type: "integer",
                  description: "研究经历数量",
                  optional: true
                },
                months_research: {
                  type: "integer",
                  description: "研究经历月数",
                  optional: true
                },
                big_name_research: {
                  type: "boolean",
                  description: "是否有知名研究经历",
                  optional: true
                },
                letter_of_rec: {
                  type: "string",
                  description: "推荐信情况",
                  optional: true
                },
                family_concern: {
                  type: "string",
                  description: "家庭相关顾虑",
                  optional: true
                },
                alternatives: {
                  type: "string",
                  description: "替代方案",
                  optional: true
                }
              }
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    if (response.choices[0].message.tool_calls) {
      const functionCall = response.choices[0].message.tool_calls;
      const functionName = functionCall[0].function.name;
      const functionArgs = JSON.parse(functionCall[0].function.arguments);

      if (functionName === "update_student_info") {
        // 添加 username 到参数中
        functionArgs.username = username;

        let studentInfo;

        try {
          if (userData) {
            // 如果用户存在，更新用户信息
            console.log(`更新用户 ${username} 的信息:`, functionArgs);
            const { data, error } = await supabase
              .from("studentinfo")
              .update(functionArgs)
              .eq("username", username)
              .select();

            if (error) {
              console.error("数据库更新错误:", error);
              throw error;
            }

            console.log("数据库更新结果:", data);
            studentInfo = { data, error };
          } else {
            // 如果用户不存在，创建新用户
            console.log(`创建新用户 ${username}:`, functionArgs);
            const { data, error } = await supabase
              .from("studentinfo")
              .insert(functionArgs)
              .select();

            if (error) {
              console.error("数据库插入错误:", error);
              throw error;
            }

            console.log("数据库插入结果:", data);
            studentInfo = { data, error };
          }

          // 获取工具调用结果
          const toolResponse = {
            role: "tool",
            tool_call_id: functionCall[0].id,
            name: functionName,
            content: JSON.stringify({
              success: true,
              message: userData ? "已更新学生信息" : "已创建学生信息",
              data: studentInfo.data
            })
          };

          // 发起第二次请求以获取AI的回复
          const secondResponse = await deepseek.chat.completions.create({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: promptData.content,
              },
              ...updatedConversationHistory,
              {
                role: "user",
                content: message,
              },
              response.choices[0].message,
              toolResponse
            ],
          });

          // 返回AI的文本回复
          return NextResponse.json({
            success: true,
            response: secondResponse.choices[0].message.content,
            studentInfo: studentInfo.data,
            db_operation: userData ? "update" : "insert"
          });

        } catch (dbError: Error | unknown) {
          console.error("数据库操作失败:", dbError);
          const errorMessage = dbError instanceof Error ? dbError.message : JSON.stringify(dbError);

          // 即使数据库操作失败，也尝试获取AI回复
          const toolResponse = {
            role: "tool",
            tool_call_id: functionCall[0].id,
            name: functionName,
            content: JSON.stringify({
              success: false,
              message: "数据库操作失败: " + errorMessage
            })
          };

          try {
            const secondResponse = await deepseek.chat.completions.create({
              model: "deepseek-chat",
              messages: [
                {
                  role: "system",
                  content: promptData.content,
                },
                ...updatedConversationHistory,
                {
                  role: "user",
                  content: message,
                },
                response.choices[0].message,
                toolResponse
              ],
            });

            return NextResponse.json({
              success: false,
              message: "数据库操作失败: " + errorMessage,
              response: secondResponse.choices[0].message.content
            }, { status: 500 });
          } catch (aiError) {
            console.error("AI响应获取失败:", aiError);
            return NextResponse.json({
              success: false,
              message: "数据库操作失败且AI响应获取失败",
              db_error: errorMessage
            }, { status: 500 });
          }
        }
      }
    }

    // 如果没有工具调用，直接返回AI回复
    return NextResponse.json({
      success: true,
      response: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error in Alice API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request",
      },
      { status: 500 }
    );
  }
}
