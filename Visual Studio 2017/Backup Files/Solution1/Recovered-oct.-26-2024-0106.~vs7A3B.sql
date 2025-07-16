SELECT 
    t1.AskSurveyId, 
    t1.Email_Address, 
    t2.ListId AS Mail_ListId,
    t2.MailId,
    t2.Time AS MailSentTime,
    t2.Subject AS MailSubject,
    t3.ListId AS Interview_ListId,
    t3.StartTime AS InterviewStartTime,
    t3.EndTime AS InterviewEndTime
FROM [Askia_Lists].[dbo].[AskList11784] AS t1
JOIN [Askia_Statistics].[dbo].[Statistic_Mail] AS t2 ON t1.AskSurveyId = t2.SurveyId
JOIN [Askia_Statistics].[dbo].[Statistic_WebInterview] AS t3 ON t2.ListId = t3.ListId
WHERE t1.AskSurveyId = '4372';
