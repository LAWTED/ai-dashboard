# The Passion Pilot

**An AI-Powered Support System for Scaffolding Multi-Year Academic/Career Journeys**

Project Deadline: April 30, 2025

Project Outcome: An MVP with 50 active users (students)

Project Next Steps: Field experimentation (A/B Test), Data collection & Analysis

# Background Literature

- **Scaffolding**: Scientists discovered that when kids are learning something new, having someone to help them step by step makes it easier. This support lets them learn new skills they couldn’t do alone (Wood, Bruner, & Ross, 1976).
- **Grit**: Researchers found that it’s not just talent that helps people succeed. Having grit, which means keeping at something even when it gets tough, is super important for reaching long-term goals (Duckworth et al., 2007).
- **Social Support**: Studies show that feeling like others care about you and will help you is really important. This kind of support can boost your motivation and help you keep going when things are hard (Cohen & Wills, 1985).
- **Passion**: Scientists learned that passion—feeling excited about something and wanting to spend time on it—is important for doing well in the long run. However, this passion needs to be kept alive over time for it to really help (Li, Han, Cohen, & Markus, 2021).
- **Self-Integrity and Values Affirmation**: It turns out that when people believe in their own values and feel good about themselves, it helps them to stay motivated, especially when facing challenges. This means that focusing on what matters to you can give you strength (Cohen, 2006).
- **Delay of Gratification**: Research has shown that being able to wait for a bigger reward instead of taking a smaller one right away is important for success. Kids who can delay gratification tend to do better in school and life because they can stick to their goals (Mischel, 1974).

# AI Chatbot (Leader: Lawted)

# **1. Lead Capture**

## 1.1 **Complete Stranger (Cold Lead) 初次接触，从零建立信任**

### 1.1.1 Scenario

- The student finds us via ads/search (no prior connection).

### 1.1.2 Opener

> Hello同学你好呀～ 是要申请grad school嘛？
>

> 我先自我介绍下，我叫Alice，中文名李星煜，本科清华，博士毕业于Stanford，目前在Stanford做research scientist（其实就是俗称的“博士后”～）。
>

> 怎么称呼你比较好呀？我给你微信备注上。
>

### 1.1.3 If Replied

- Store the student’s name in our database;
- Move to the next stage.

### 1.1.4 If Not Replied

> 嗨～ 你好啊同学！之前你是不是在忙来着，看你加我好像是要申grad school的？有什么具体想了解的不，欢迎提问哈！
>
- If the student doesn’t reply after 2 prompts, drop the lead.

# **2. Qualification**

## 2.1 **Key Data Points to Capture**

| **Data Field** | **AI Prompt Example** | **Storage Format (CRM)** | **Return** |
| --- | --- | --- | --- |
| **Target Degree** | "你是申请PhD吗？还是Master呀？" | **degree_type** (string) | “赞赞！读PhD还是挺香的，哈哈，还可以全奖吃喝玩乐～” |
| **Timeline** | "你是什么时候打算申呢？“ | **application_cycle** (year) | “Okk！今年申请季的话，学校是9月份就开始开放网申系统了哈，到时你就可以提交申请啦。然后，大部分PhD项目都是12月中截止。不过有些学校ddl超级早～比如Stanford、普林、Michigan是12月1号就截啦。" |
| **Specific Area** | “你目前科研细分领域有定下来吗？你自己最感兴趣的area或者research keywords这样子～” | **specific_area** (text) | “噢噢，做X方向很酷呀！我们系A就是做这个方向的。” |
| **Dream Advisors** | “有没有什么你特别喜欢TA科研方向的教授呀～Like your dream advisor这样～” | **dream_advisors** (text) | “哈哈我们有碰到过！之前学术会议的时候。A最近的论文你有看嘛？关于X的，里面有提到挺新的一些方向和contribution。” |
| **Dream School(s)** | "那选校方面你有什么偏好嘛？学校名气or地理位置什么的。" | **dream_schools** (list/text) | “Ok好呢！我基本上get你喜欢的科研方向和最理想的dream school了。突然想到，给你安利一下，A项目蛮好的，我去年带的学生有申到过，导师是那种真的很nice，很chill、handsoff的导师，不会压榨学生那种～” |
| **Current Prep** | “你目前准备的情况是怎么样呀？” | **prep** (text) | “嗯嗯。” |
| **CV/Resume** | “方便把你目前的CV或者简历发来一份不～我看下可能可以更有针对性地帮到你，我们一起brainstorm下怎么申到好的PhD programs。” | **resume** (doc) | “收到！让我来看下然后回你哈～”

- AI parse the doc; |
| **Current Challenge/ Pain Points** | “你目前自己有什么最迷茫/对于申PhD最担忧的点吗？” | **challenge** (text) | - AI parse the doc; |
| **Current Institution** |  | **current_school** (string) |  |
| **GPA** |  | **gpa** (numeric) |  |
| **Gender** |  | **gender** (binary) |  |
| **Undergrad Degree** |  | **undergraduate_degree** (string) |  |
| **Master’s Degree** |  | **master_degree** (string) |  |
| **Number of Research Experience** |  | **how_many_research** (numeric) |  |
| **Total Length of Research Experience** |  | **months_research** (numeric) |  |
| **Research Big Name** |  | **big_name_research** (binary) |  |
| **Letters of Recommendation** | “对了，之前忘记问，你目前推荐人找得怎么样啦？” | **letter_of_rec** (text) | “需要3位哈。现在找不满也没关系滴。然后如果有超过3位，大部分学校最多支持upload 4-5封推荐信这样子。” |
| **Family Situation** | “那目前你家里是怎么想的？支持你申PhD吗？或者说他们有什么顾虑是你需要去说服的吗？” | **family_concern** (text) | “嗯嗯，太棒了！你好幸福啊，有这么支持你的family～” |
| Alternatives | “目前你有没有别的选项呀？如果不去读博的话，打算做什么呢？” | **alternatives** (text) |  |

## 2.2 AI Outputs Opportunity Mapping

- AI identifies **tailored pathways** according to each student’s unique concerns and motivations: Low GPA, Weak recommendations, No publications, Visa/ Immigration risks, Imposter syndrome, TOEFL/GRE, Switching fields, Time crunch, SOP/PS struggles, Interview fears Length, Unclear research area, Competitive field, Gap year doubts, School prestige, Burnout PhD lifestyle, Full funding, Dream advisor, Family pressure, Family support.

## 2.3 Initial Screening

- if 要转专业来读心理学且教育或实习经历中均无名校背景（中国top 5，或北美top 30），则直接phase out；
- if GPA < 3.3，则直接phase out；
- if 学生在3次nudge后不回复，也是直接phase out；
- others, move to the “immediate empowering” conversation.

# **3. Immediate Empowering**

## 3.1 Logic

- If in 2.1 (**Current Challenge/ Pain Points**), the student raises a concern, then, AI (The Alice Chatbot) gives corresponding replies (based on the table below);
- The chatbot handles mainly: **Research interests, why PhD/Psych (the soul-searching discussion), Dream programs & mentors, PhD lifestyle (honestly sharing pros and cons)**;
- If students self-report challenge/concern, AI replies with immediate empowering materials;
- If no self-report challenge/concern, AI prompts in the following order:
    1. Weak recommendations → [要推荐信的邮件模版] [好推荐信的要点举例]
    2. GPA concern → [推过往学生靠科研背景提升和会议发表逆袭的案例]
    3. No publications/ Little research experience → [推过往学生靠科研背景提升和会议发表逆袭的案例]
    4. Unclear research area → [推过往学生靠科研背景提升和会议发表逆袭的案例] [文书反复修改的截屏记录用于motivate学生多做修改] [自己文书当年改的满篇红色的修改记录去normalize challenges & hardship]

## 3.2 Handoff

### 3.2.1 Trigger

| Scenario | Action |
| --- | --- |
| 学生问：“学姐你是在留学机构吗？可以找你做指导吗？” | Forward them the contact of the consulting firm |
| 学生没有主动提到 | 在发送3个过往学生成功案例后，询问，“是否需要对接专门的机构来聊一聊？” |

### 3.2.2 Continuous Support

- This area lacks prior research and does not have a clear mapping between student prompts and ideal answers. Currently, I am considering providing continuous social-emotional support. In the next stage of research, I plan to categorize students' questions, which will likely center around cultural capital topics. For example, students might ask how to engage with a prominent professor in a way that leaves a strong impression—skills that are challenging to teach and are often acquired through apprenticeship. Ultimately, our goal is to develop a comprehensive AI support system that equips students with both knowledge and hard skills, as well as essential soft skills, such as insider knowledge and effective communication strategies.

# 4. Institutional Partner Support (Will be unlocked in the near future)

## 4.1 Opener

## 4.2 Quotation

## 4.3 Sales Tactics

## 4.4 Continuing Support

## 4.5 Case Closing